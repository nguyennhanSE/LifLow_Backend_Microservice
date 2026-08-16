import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import { LokiService } from 'libs/observability/loki/loki.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  LOYALTY_QUEUE_NAME,
  LOYALTY_REQUEST_UPDATE_JOB,
  LoyaltyRequestUpdateJobPayload,
} from './loyalty-queue.constant';

@Processor(LOYALTY_QUEUE_NAME)
export class LoyaltyQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly lokiService: LokiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case LOYALTY_REQUEST_UPDATE_JOB:
        return this.handleRequestUpdate(
          job as Job<LoyaltyRequestUpdateJobPayload>,
        );

      default:
        this.logger.warn(`[LoyaltyQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private async handleRequestUpdate(job: Job<LoyaltyRequestUpdateJobPayload>) {
    const { requestLogId, log } = job.data;

    if (!requestLogId) {
      throw new Error('[LoyaltyQueue] requestLogId is required');
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
