import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  LOYALTY_QUEUE_NAME,
  LOYALTY_REQUEST_UPDATE_JOB,
  LoyaltyRequestUpdateJobPayload,
} from './loyalty-queue.constant';

@Injectable()
export class LoyaltyQueueService {
  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(LOYALTY_QUEUE_NAME) private readonly loyaltyQueue: Queue,
  ) {}

  async enqueueRequestUpdate(
    payload: LoyaltyRequestUpdateJobPayload,
    options?: JobsOptions,
  ) {
    try {
      return await this.loyaltyQueue.add(LOYALTY_REQUEST_UPDATE_JOB, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
        ...options,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[LoyaltyQueue] Failed to enqueue Loki push job for requestLog=${payload.requestLogId}: ${errorMessage}`,
        error instanceof Error ? error : undefined,
        LoyaltyQueueService.name,
      );

      throw new Error(`Failed to enqueue Loki push job: ${errorMessage}`);
    }
  }
}
