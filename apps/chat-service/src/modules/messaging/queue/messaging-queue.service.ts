import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  MESSAGE_CREATED_JOB,
  MESSAGING_QUEUE_NAME,
  MessageCreatedJobPayload,
} from './messaging-queue.constant';

@Injectable()
export class MessagingQueueService {
  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(MESSAGING_QUEUE_NAME) private readonly messagingQueue: Queue,
  ) {}

  async enqueueMessageCreated(payload: MessageCreatedJobPayload) {
    try {
      return await this.messagingQueue.add(MESSAGE_CREATED_JOB, payload, {
        jobId: `${MESSAGE_CREATED_JOB}-${payload.messageId}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
    } catch (error) {
      this.logger.error(
        `[MessagingQueue] Failed to enqueue message created job ${payload.messageId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error : undefined,
        MessagingQueueService.name,
      );

      throw error;
    }
  }
}
