import type { LokiLogData } from 'libs/observability/loki/types/loki.type';

export const CHAT_QUEUE_NAME = 'chat-service-queue';

export const CHAT_REQUEST_UPDATE_JOB = 'chat-request-update-job';

export interface ChatRequestUpdateJobPayload {
  requestLogId: string;
  log: LokiLogData;
}
