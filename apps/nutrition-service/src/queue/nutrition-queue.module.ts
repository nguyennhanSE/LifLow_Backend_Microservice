import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { LokiModule } from 'libs/observability/loki/loki.module';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../prisma/prisma.module';
import { NUTRITION_QUEUE_NAME } from './nutrition-queue.constant';
import { NutritionQueueProcessor } from './nutrition-queue.processor';
import { NutritionQueueService } from './nutrition-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    LokiModule,
    AppQueueModule.registerQueue(NUTRITION_QUEUE_NAME),
  ],
  providers: [NutritionQueueService, NutritionQueueProcessor],
  exports: [NutritionQueueService],
})
export class NutritionQueueModule {}
