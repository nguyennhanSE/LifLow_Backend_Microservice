import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AppQueueModule } from 'libs/queue';
import { notificationServiceConfig } from './config/notification-service.config';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationQueueModule } from './queue/notification-queue.module';

@Module({
  imports: [
    AppConfigModule.forFeature([notificationServiceConfig]),
    CommonModule,
    AppQueueModule.forRoot(),
    PrismaModule,
    NotificationQueueModule,
  ],
  controllers: [NotificationServiceController],
  providers: [
    NotificationServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class NotificationServiceModule {}
