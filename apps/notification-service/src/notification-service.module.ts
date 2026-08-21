import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AppQueueModule } from 'libs/queue';
import { notificationServiceConfig } from './config/notification-service.config';
import { NotificationHealthGrpcController } from './grpc/health/health.grpc.controller';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { EventModule } from './modules/events/event.module';
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
    EventModule,
  ],
  controllers: [
    NotificationServiceController,
    NotificationHealthGrpcController,
  ],
  providers: [
    NotificationServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class NotificationServiceModule {}
