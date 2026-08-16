import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { LokiModule } from 'libs/observability/loki/loki.module';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../prisma/prisma.module';
import { LOYALTY_QUEUE_NAME } from './loyalty-queue.constant';
import { LoyaltyQueueProcessor } from './loyalty-queue.processor';
import { LoyaltyQueueService } from './loyalty-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    LokiModule,
    AppQueueModule.registerQueue(LOYALTY_QUEUE_NAME),
  ],
  providers: [LoyaltyQueueService, LoyaltyQueueProcessor],
  exports: [LoyaltyQueueService],
})
export class LoyaltyQueueModule {}
