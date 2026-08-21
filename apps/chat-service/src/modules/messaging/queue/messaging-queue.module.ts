import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppQueueModule } from 'libs/queue';
import { MESSAGING_QUEUE_NAME } from './messaging-queue.constant';
import { MessagingQueueProcessor } from './messaging-queue.processor';
import { MessagingQueueService } from './messaging-queue.service';

@Module({
  imports: [LoggerModule, AppQueueModule.registerQueue(MESSAGING_QUEUE_NAME)],
  providers: [MessagingQueueService, MessagingQueueProcessor],
  exports: [MessagingQueueService],
})
export class MessagingQueueModule {}
