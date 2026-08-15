import type { LokiLogData } from 'libs/observability/types/loki.type';

export const IDENTITY_QUEUE_NAME = 'identity-service-queue';

export const IDENTITY_REQUEST_UPDATE_JOB = 'identity-request-update-job';

export interface IdentityRequestUpdateJobPayload {
  requestLogId: string;
  log: LokiLogData;
}
