export interface IdentityRequestMetadata {
  // Trace / Request Identifiers
  traceId?: string | null;
  requestId?: string | null;
  parentRequestId?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
  requestPattern?: string | null;
  requestStatus?: string | null;

  // Service / Application Identifiers
  serviceName?: string | null;
  serviceIp?: string | null;
  serviceMetadata?: Record<string, unknown> | null;

  // Actor / User Identifiers
  userId?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  actorType?: string | null;
}

export interface IdentityRequestPayload<TData> {
  data: TData;
  metadata?: IdentityRequestMetadata;
}
