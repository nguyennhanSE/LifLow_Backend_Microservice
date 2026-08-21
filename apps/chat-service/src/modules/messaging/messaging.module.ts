import { Module } from '@nestjs/common';
import { ChatGrpcController } from '../../grpc/chat/chat.grpc.controller';
import { ChatMessagingController } from '../../messaging/chat/chat.messaging.controller';
import { MessagingRepository } from './repositories/messaging.repository';
import { MessagingService } from './messaging.service';

@Module({
  controllers: [ChatMessagingController, ChatGrpcController],
  providers: [MessagingService, MessagingRepository],
  exports: [MessagingService],
})
export class MessagingModule {}
