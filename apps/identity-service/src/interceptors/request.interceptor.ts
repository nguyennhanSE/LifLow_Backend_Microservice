import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import {
  Prisma,
  RequestStatus,
} from 'libs/prisma/generated/identity-service/client';
import type { LokiLogData } from 'libs/observability/types/loki.type';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { randomUUID } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import type {
  IdentityRequestMetadata,
  IdentityRequestPayload,
} from '../common';
import { LokiService } from '../loki/loki.service';
import { PrismaService } from '../prisma/prisma.service';

const SERVICE_NAME = 'identity-service';

type RequestPayload = Partial<IdentityRequestPayload<unknown>> & {
  metadata?: IdentityRequestMetadata;
};

type RequestLogContext = {
  id: string;
  traceId?: string;
  requestId?: string;
  parentRequestId?: string;
  correlationId?: string;
  causationId?: string;
  requestPattern?: string;
  serviceName: string;
  serviceIp?: string;
  serviceMetadata?: Record<string, unknown>;
  userId?: string;
  anonymousId?: string;
  sessionId?: string;
  actorType?: string;
  entityType?: string;
  entityId?: string;
  occurredAt: Date;
};

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  private readonly serviceIp = this.getServiceIp();

  constructor(
    private readonly prisma: PrismaService,
    private readonly lokiService: LokiService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const payload = this.getPayload(context);
    const metadata = payload.metadata;
    const requestPattern =
      this.getRequestPattern(context) ?? metadata?.requestPattern ?? undefined;
    const requestLog = await this.createRequestLog({
      traceId: metadata?.traceId ?? undefined,
      parentRequestId:
        metadata?.requestId ?? metadata?.parentRequestId ?? undefined,
      correlationId: metadata?.correlationId ?? undefined,
      causationId: metadata?.causationId ?? undefined,
      requestPattern,
      serviceName: SERVICE_NAME,
      serviceIp: this.serviceIp,
      serviceMetadata: metadata?.serviceMetadata ?? undefined,
      userId: metadata?.userId ?? undefined,
      anonymousId: metadata?.anonymousId ?? undefined,
      sessionId: metadata?.sessionId ?? undefined,
      actorType: metadata?.actorType ?? undefined,
      occurredAt: new Date(),
    });

    let status: RequestStatus = RequestStatus.COMPLETED;

    return next.handle().pipe(
      catchError((error: unknown) => {
        status = RequestStatus.FAILED;
        void this.finalizeRequestLog(requestLog, status);

        return throwError(() => error);
      }),
      finalize(() => {
        if (status === RequestStatus.COMPLETED) {
          void this.finalizeRequestLog(requestLog, status);
        }
      }),
    );
  }

  private getPayload(context: ExecutionContext): RequestPayload {
    return context.switchToRpc().getData<RequestPayload>() ?? {};
  }

  private async createRequestLog(
    input: Omit<RequestLogContext, 'id' | 'requestId'>,
  ): Promise<RequestLogContext> {
    const requestLog = await this.prisma.$transaction(async (tx) => {
      const createdRequestLog = await tx.requestLog.create({
        data: {
          requestId: `pending-${randomUUID()}`,
          traceId: input.traceId,
          parentRequestId: input.parentRequestId,
          correlationId: input.correlationId,
          causationId: input.causationId,
          requestPattern: input.requestPattern,
          requestStatus: RequestStatus.PENDING,
          serviceName: input.serviceName,
          serviceIp: input.serviceIp,
          serviceMetadata: this.toJsonInput(input.serviceMetadata),
          userId: input.userId,
          anonymousId: input.anonymousId,
          sessionId: input.sessionId,
          actorType: input.actorType,
          entityType: input.entityType,
          entityId: input.entityId,
          occurredAt: input.occurredAt,
        },
      });
      const requestId = `request-${createdRequestLog.sequence}`;

      return tx.requestLog.update({
        where: { id: createdRequestLog.id },
        data: { requestId },
      });
    });

    return {
      id: requestLog.id,
      traceId: requestLog.traceId ?? undefined,
      requestId: requestLog.requestId ?? undefined,
      parentRequestId: requestLog.parentRequestId ?? undefined,
      correlationId: requestLog.correlationId ?? undefined,
      causationId: requestLog.causationId ?? undefined,
      requestPattern: requestLog.requestPattern ?? undefined,
      serviceName: requestLog.serviceName ?? SERVICE_NAME,
      serviceIp: requestLog.serviceIp ?? undefined,
      serviceMetadata: this.asRecord(requestLog.serviceMetadata),
      userId: requestLog.userId ?? undefined,
      anonymousId: requestLog.anonymousId ?? undefined,
      sessionId: requestLog.sessionId ?? undefined,
      actorType: requestLog.actorType ?? undefined,
      entityType: requestLog.entityType ?? undefined,
      entityId: requestLog.entityId ?? undefined,
      occurredAt: requestLog.occurredAt,
    };
  }

  private async finalizeRequestLog(
    requestLog: RequestLogContext,
    status: RequestStatus,
  ): Promise<void> {
    try {
      await this.prisma.requestLog.update({
        where: { id: requestLog.id },
        data: { requestStatus: status },
      });
      await this.lokiService.push(this.toLokiLogData(requestLog, status));
      await this.prisma.requestLog.update({
        where: { id: requestLog.id },
        data: {
          lokiPushedAt: new Date(),
          lokiPushError: null,
        },
      });
    } catch (error) {
      await this.prisma.requestLog
        .update({
          where: { id: requestLog.id },
          data: {
            lokiPushError:
              error instanceof Error ? error.message : String(error),
            lokiRetryCount: { increment: 1 },
          },
        })
        .catch(() => undefined);
    }
  }

  private toLokiLogData(
    requestLog: RequestLogContext,
    status: RequestStatus,
  ): LokiLogData {
    return {
      traceId: requestLog.traceId,
      requestId: requestLog.requestId,
      parentRequestId: requestLog.parentRequestId,
      correlationId: requestLog.correlationId,
      causationId: requestLog.causationId,
      requestPattern: requestLog.requestPattern,
      requestStatus: status,
      serviceName: requestLog.serviceName,
      serviceIp: requestLog.serviceIp,
      serviceMetadata: requestLog.serviceMetadata,
      entityId: requestLog.entityId,
      entityType: requestLog.entityType,
      userId: requestLog.userId,
      anonymousId: requestLog.anonymousId,
      sessionId: requestLog.sessionId,
      actorType: requestLog.actorType,
      occurredAt: requestLog.occurredAt.toISOString(),
    };
  }

  private getRequestPattern(context: ExecutionContext): string | undefined {
    const metadataPattern = Reflect.getMetadata(
      PATTERN_METADATA,
      context.getHandler(),
    ) as unknown[] | undefined;
    const firstPattern = metadataPattern?.[0];

    if (firstPattern) {
      return typeof firstPattern === 'string'
        ? firstPattern
        : JSON.stringify(firstPattern);
    }

    const rpcContext = context.switchToRpc().getContext<RmqContext>();
    const contextPattern = rpcContext?.getPattern?.();

    return contextPattern
      ? typeof contextPattern === 'string'
        ? contextPattern
        : JSON.stringify(contextPattern)
      : undefined;
  }

  private asRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return value as Record<string, unknown>;
  }

  private toJsonInput(
    value: Record<string, unknown> | undefined,
  ): Prisma.InputJsonValue | undefined {
    return value === undefined ? undefined : (value as Prisma.InputJsonObject);
  }

  private getServiceIp(): string | undefined {
    const interfaces = networkInterfaces();

    for (const networkInterface of Object.values(interfaces)) {
      for (const address of networkInterface ?? []) {
        if (address.family === 'IPv4' && !address.internal) {
          return address.address;
        }
      }
    }

    return undefined;
  }
}
