import { Module } from '@nestjs/common';
import { ChatGrpcController } from '../../grpc/chat/chat.grpc.controller';
import { ChatMessagingController } from '../../messaging/chat/chat.messaging.controller';
import { MessagingQueueModule } from './queue/messaging-queue.module';
import { MessagingRepository } from './repositories/messaging.repository';
import { MessagingService } from './messaging.service';

@Module({
  imports: [MessagingQueueModule],
  controllers: [ChatMessagingController, ChatGrpcController],
  providers: [MessagingService, MessagingRepository],
  exports: [MessagingService],
})
export class MessagingModule {}
