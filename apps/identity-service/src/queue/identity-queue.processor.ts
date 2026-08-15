import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import { LokiService } from '../../../../libs/observability/loki/loki.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  IDENTITY_QUEUE_NAME,
  IDENTITY_REQUEST_UPDATE_JOB,
  IdentityRequestUpdateJobPayload,
} from './identity-queue.constant';

@Processor(IDENTITY_QUEUE_NAME)
export class IdentityQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly lokiService: LokiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case IDENTITY_REQUEST_UPDATE_JOB:
        return this.handleRequestUpdate(
          job as Job<IdentityRequestUpdateJobPayload>,
        );

      default:
        this.logger.warn(`[IdentityQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private async handleRequestUpdate(job: Job<IdentityRequestUpdateJobPayload>) {
    const { requestLogId, log } = job.data;

    if (!requestLogId) {
      throw new Error('[IdentityQueue] requestLogId is required');
    }

    try {
      await this.lokiService.push(log);
      await this.prisma.requestLog.update({
        where: { id: requestLogId },
        data: {
          lokiPushedAt: new Date(),
          lokiPushError: null,
        },
      });

      return {
        requestLogId,
        requestId: log.requestId,
        pushed: true,
      };
    } catch (error) {
      await this.prisma.requestLog
        .update({
          where: { id: requestLogId },
          data: {
            lokiPushError:
              error instanceof Error ? error.message : String(error),
            lokiRetryCount: { increment: 1 },
          },
        })
        .catch(() => undefined);

      throw error;
    }
  }
}
