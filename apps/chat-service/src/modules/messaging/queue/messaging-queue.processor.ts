import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  MESSAGE_CREATED_JOB,
  MESSAGING_QUEUE_NAME,
  MessageCreatedJobPayload,
} from './messaging-queue.constant';

@Processor(MESSAGING_QUEUE_NAME)
export class MessagingQueueProcessor extends WorkerHost {
  constructor(private readonly logger: AppLogger) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case MESSAGE_CREATED_JOB:
        return this.handleMessageCreated(job as Job<MessageCreatedJobPayload>);

      default:
        this.logger.warn(`[MessagingQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private handleMessageCreated(job: Job<MessageCreatedJobPayload>) {
    this.logger.debug(
      `[MessagingQueue] Message created: ${JSON.stringify(job.data)}`,
    );

    return {
      processed: true,
      messageId: job.data.messageId,
      roomId: job.data.roomId,
    };
  }
}
