export interface RequestMetadata {
    ip: string | null;
    userAgent: string | null;
    requestId: string | null;
    traceId: string | null;
}


export type IdentityRequestMetadata = RequestMetadata;

export type LoyaltyRequestMetadata = RequestMetadata;