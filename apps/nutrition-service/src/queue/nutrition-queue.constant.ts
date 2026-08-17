import type { LokiLogData } from 'libs/observability/loki/types/loki.type';

export const NUTRITION_QUEUE_NAME = 'nutrition-service-queue';

export const NUTRITION_REQUEST_UPDATE_JOB = 'nutrition-request-update-job';

export interface NutritionRequestUpdateJobPayload {
  requestLogId: string;
  log: LokiLogData;
}
