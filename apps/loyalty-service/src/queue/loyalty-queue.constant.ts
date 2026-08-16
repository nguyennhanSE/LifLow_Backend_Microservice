import type { LokiLogData } from 'libs/observability/loki/types/loki.type';

export const LOYALTY_QUEUE_NAME = 'loyalty-service-queue';

export const LOYALTY_REQUEST_UPDATE_JOB = 'loyalty-request-update-job';

export interface LoyaltyRequestUpdateJobPayload {
  requestLogId: string;
  log: LokiLogData;
}
