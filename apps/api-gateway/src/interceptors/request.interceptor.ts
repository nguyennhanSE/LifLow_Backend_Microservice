import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import type { RequestMetadata } from '../clients/metadata/client.metadata';
import { TraceStatus } from '../traces/enums/trace-status.enum';
import { TraceService } from '../traces/trace.service';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  constructor(private readonly traceService: TraceService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const startedAt = new Date();
    const requestIp = this.getClientIp(request);
    const userAgent = this.getHeader(request.headers['user-agent']) ?? null;
    const traceId = await this.traceService.startTrace({
      method: request.method,
      path: request.originalUrl ?? request.url,
      ip: requestIp ?? '',
      userAgent: userAgent ?? '',
      startedAt,
    });
    const metadata: RequestMetadata = {
      traceId,
      requestIp,
    };

    request.metadata = metadata;
    response.setHeader('x-trace-id', traceId);

    let status = TraceStatus.COMPLETED;

    return next.handle().pipe(
      catchError((error: unknown) => {
        status = TraceStatus.FAILED;

        return throwError(() => error);
      }),
      finalize(() => {
        void this.traceService.finishTrace({
          traceId,
          endedAt: new Date(),
          status,
        });
      }),
    );
  }

  private getHeader(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  private getClientIp(request: Request): string | null {
    const forwardedFor = this.getHeader(request.headers['x-forwarded-for']);
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() || null;
    }

    return request.ip ?? request.socket?.remoteAddress ?? null;
  }
}
