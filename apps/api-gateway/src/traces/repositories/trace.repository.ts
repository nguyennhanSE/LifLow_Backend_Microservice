import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateTraceInput {
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  startedAt: Date;
}

export interface UpdateTraceStatusInput {
  traceId: string;
  endedAt: Date;
  status: string;
}

@Injectable()
export class TraceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTrace(input: CreateTraceInput): Promise<{ traceId: string }> {
    return await this.prisma.$transaction(async (tx) => {
      const trace = await tx.trace.create({
        data: {
          traceId: `pending-${randomUUID()}`,
          method: input.method,
          path: input.path,
          ip: input.ip,
          userAgent: input.userAgent,
          startedAt: input.startedAt,
          endedAt: input.startedAt,
          status: 'pending',
        },
      });
      const traceId = `trace-${trace.sequence}`;

      await tx.trace.update({
        where: { id: trace.id },
        data: { traceId },
      });

      return { traceId };
    });
  }

  updateTraceStatus(input: UpdateTraceStatusInput): Promise<unknown> {
    return this.prisma.trace.update({
      where: { traceId: input.traceId },
      data: {
        endedAt: input.endedAt,
        status: input.status,
      },
    });
  }
}
