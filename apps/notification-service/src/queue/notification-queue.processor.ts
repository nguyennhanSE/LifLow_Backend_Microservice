import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import { LokiService } from 'libs/observability/loki/loki.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NOTIFICATION_QUEUE_NAME,
  NOTIFICATION_REQUEST_UPDATE_JOB,
  NotificationRequestUpdateJobPayload,
} from './notification-queue.constant';

@Processor(NOTIFICATION_QUEUE_NAME)
export class NotificationQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly lokiService: LokiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case NOTIFICATION_REQUEST_UPDATE_JOB:
        return this.handleRequestUpdate(
          job as Job<NotificationRequestUpdateJobPayload>,
        );

      default:
        this.logger.warn(`[NotificationQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private async handleRequestUpdate(
    job: Job<NotificationRequestUpdateJobPayload>,
  ) {
    const { requestLogId, log } = job.data;

    if (!requestLogId) {
      throw new Error('[NotificationQueue] requestLogId is required');
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
