import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  NUTRITION_QUEUE_NAME,
  NUTRITION_REQUEST_UPDATE_JOB,
  NutritionRequestUpdateJobPayload,
} from './nutrition-queue.constant';

@Injectable()
export class NutritionQueueService {
  constructor(
    private readonly logger: AppLogger,
    @InjectQueue(NUTRITION_QUEUE_NAME) private readonly nutritionQueue: Queue,
  ) {}

  async enqueueRequestUpdate(
    payload: NutritionRequestUpdateJobPayload,
    options?: JobsOptions,
  ) {
    try {
      return await this.nutritionQueue.add(
        NUTRITION_REQUEST_UPDATE_JOB,
        payload,
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
          ...options,
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[NutritionQueue] Failed to enqueue Loki push job for requestLog=${payload.requestLogId}: ${errorMessage}`,
        error instanceof Error ? error : undefined,
        NutritionQueueService.name,
      );

      throw new Error(`Failed to enqueue Loki push job: ${errorMessage}`);
    }
  }
}
