import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AppQueueModule } from 'libs/queue';
import { RedisCacheModule, RedisMessagingModule } from 'libs/redis';
import { chatServiceConfig } from './config/chat-service.config';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChatQueueModule } from './queue/chat-queue.module';

@Module({
  imports: [
    AppConfigModule.forFeature([chatServiceConfig]),
    CommonModule,
    AppQueueModule.forRoot(),
    PrismaModule,
    ChatQueueModule,
    RedisCacheModule,
    RedisMessagingModule,
  ],
  controllers: [ChatServiceController],
  providers: [
    ChatServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class ChatServiceModule {}
