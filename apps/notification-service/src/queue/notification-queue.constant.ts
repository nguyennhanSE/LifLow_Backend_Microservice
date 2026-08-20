import type { LokiLogData } from 'libs/observability/loki/types/loki.type';

export const NOTIFICATION_QUEUE_NAME = 'notification-service-queue';

export const NOTIFICATION_REQUEST_UPDATE_JOB =
  'notification-request-update-job';

export interface NotificationRequestUpdateJobPayload {
  requestLogId: string;
  log: LokiLogData;
}
