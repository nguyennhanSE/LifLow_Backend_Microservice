import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { LokiModule } from 'libs/observability/loki/loki.module';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../prisma/prisma.module';
import { CHAT_QUEUE_NAME } from './chat-queue.constant';
import { ChatQueueProcessor } from './chat-queue.processor';
import { ChatQueueService } from './chat-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    LokiModule,
    AppQueueModule.registerQueue(CHAT_QUEUE_NAME),
  ],
  providers: [ChatQueueService, ChatQueueProcessor],
  exports: [ChatQueueService],
})
export class ChatQueueModule {}
