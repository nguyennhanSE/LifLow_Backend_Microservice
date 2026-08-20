import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  CHAT_QUEUE_NAME,
  CHAT_REQUEST_UPDATE_JOB,
  ChatRequestUpdateJobPayload,
} from './chat-queue.constant';

@Injectable()
export class ChatQueueService {
  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(CHAT_QUEUE_NAME) private readonly chatQueue: Queue,
  ) {}

  async enqueueRequestUpdate(
    payload: ChatRequestUpdateJobPayload,
    options?: JobsOptions,
  ) {
    try {
      return await this.chatQueue.add(CHAT_REQUEST_UPDATE_JOB, payload, {
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
        `[ChatQueue] Failed to enqueue Loki push job for requestLog=${payload.requestLogId}: ${errorMessage}`,
        error instanceof Error ? error : undefined,
        ChatQueueService.name,
      );

      throw new Error(`Failed to enqueue Loki push job: ${errorMessage}`);
    }
  }
}
