export interface LoyaltyRequestMetadata {
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  traceId: string | null;
}

export interface LoyaltyRequestPayload<TData> {
  data: TData;
  metadata?: LoyaltyRequestMetadata;
}
