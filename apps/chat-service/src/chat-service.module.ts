import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AppQueueModule } from 'libs/queue';
import { RedisCacheModule, RedisMessagingModule } from 'libs/redis';
import { chatServiceConfig } from './config/chat-service.config';
import { ChatHealthGrpcController } from './grpc/health/health.grpc.controller';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { MessagingModule } from './modules/messaging/messaging.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatQueueModule } from './queue/chat-queue.module';

@Module({
  imports: [
    AppConfigModule.forFeature([chatServiceConfig]),
    CommonModule,
    AppQueueModule.forRoot(),
    PrismaModule,
    ChatQueueModule,
    MessagingModule,
    RedisCacheModule,
    RedisMessagingModule,
  ],
  controllers: [ChatServiceController, ChatHealthGrpcController],
  providers: [
    ChatServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class ChatServiceModule {}
