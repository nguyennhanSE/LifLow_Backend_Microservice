export interface NotificationRequestMetadata {
  // Trace / Request Identifiers
  traceId?: string | null;
  requestId?: string | null;
  parentRequestId?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
  requestPattern?: string | null;
  requestStatus?: string | null;

  // Service / source context
  serviceName?: string | null;
  serviceIp?: string | null;
  serviceMetadata?: Record<string, unknown> | null;

  // Actor
  userId?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  actorType?: string | null;

  // Gateway request context
  requestIp?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface NotificationRequestPayload<TData> {
  data: TData;
  metadata?: NotificationRequestMetadata;
}
