export interface IdentityRequestMetadata {
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  traceId: string | null;
}

export interface IdentityRequestPayload<TData> {
  data: TData;
  metadata?: IdentityRequestMetadata;
}