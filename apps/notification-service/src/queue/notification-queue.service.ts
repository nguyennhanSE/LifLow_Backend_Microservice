import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  NOTIFICATION_QUEUE_NAME,
  NOTIFICATION_REQUEST_UPDATE_JOB,
  NotificationRequestUpdateJobPayload,
} from './notification-queue.constant';

@Injectable()
export class NotificationQueueService {
  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(NOTIFICATION_QUEUE_NAME)
    private readonly notificationQueue: Queue,
  ) {}

  async enqueueRequestUpdate(
    payload: NotificationRequestUpdateJobPayload,
    options?: JobsOptions,
  ) {
    try {
      return await this.notificationQueue.add(
        NOTIFICATION_REQUEST_UPDATE_JOB,
        payload,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
          ...options,
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[NotificationQueue] Failed to enqueue Loki push job for requestLog=${payload.requestLogId}: ${errorMessage}`,
        error instanceof Error ? error : undefined,
        NotificationQueueService.name,
      );

      throw new Error(`Failed to enqueue Loki push job: ${errorMessage}`);
    }
  }
}
