import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import { LokiService } from 'libs/observability/loki/loki.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CHAT_QUEUE_NAME,
  CHAT_REQUEST_UPDATE_JOB,
  ChatRequestUpdateJobPayload,
} from './chat-queue.constant';

@Processor(CHAT_QUEUE_NAME)
export class ChatQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly lokiService: LokiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case CHAT_REQUEST_UPDATE_JOB:
        return this.handleRequestUpdate(
          job as Job<ChatRequestUpdateJobPayload>,
        );

      default:
        this.logger.warn(`[ChatQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private async handleRequestUpdate(job: Job<ChatRequestUpdateJobPayload>) {
    const { requestLogId, log } = job.data;

    if (!requestLogId) {
      throw new Error('[ChatQueue] requestLogId is required');
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
