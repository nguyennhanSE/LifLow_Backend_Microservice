import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  IDENTITY_QUEUE_NAME,
  IDENTITY_REQUEST_UPDATE_JOB,
  IdentityRequestUpdateJobPayload,
} from './identity-queue.constant';

@Injectable()
export class IdentityQueueService {
  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(IDENTITY_QUEUE_NAME) private readonly identityQueue: Queue,
  ) {}

  async enqueueRequestUpdate(
    payload: IdentityRequestUpdateJobPayload,
    options?: JobsOptions,
  ) {
    try {
      return await this.identityQueue.add(
        IDENTITY_REQUEST_UPDATE_JOB,
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
        `[IdentityQueue] Failed to enqueue Loki push job for requestLog=${payload.requestLogId}: ${errorMessage}`,
        error instanceof Error ? error : undefined,
        IdentityQueueService.name,
      );

      throw new Error(`Failed to enqueue Loki push job: ${errorMessage}`);
    }
  }
}
