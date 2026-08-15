export interface LokiLogData {
  // Trace / Request Identifiers
  traceId?: string;
  requestId?: string;
  parentRequestId?: string;
  correlationId?: string;
  causationId?: string;
  requestPattern?: string;
  requestStatus?: string;

  // Service / Application Identifiers
  serviceName: string;
  serviceIp?: string;
  serviceMetadata?: Record<string, unknown>;

  // Entity in service
  entityId?: string;
  entityType?: string;

  // Actor / User Identifiers
  userId?: string;
  anonymousId?: string;
  sessionId?: string;
  actorType?: string;

  // Timestamp
  occurredAt: string;
}
