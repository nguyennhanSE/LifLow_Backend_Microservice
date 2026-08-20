import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { LokiModule } from 'libs/observability/loki/loki.module';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../prisma/prisma.module';
import { NOTIFICATION_QUEUE_NAME } from './notification-queue.constant';
import { NotificationQueueProcessor } from './notification-queue.processor';
import { NotificationQueueService } from './notification-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    LokiModule,
    AppQueueModule.registerQueue(NOTIFICATION_QUEUE_NAME),
  ],
  providers: [NotificationQueueService, NotificationQueueProcessor],
  exports: [NotificationQueueService],
})
export class NotificationQueueModule {}
