export interface RequestMetadata {
    ip: string | null;
    userAgent: string | null;
    requestId: string;
    traceId: string;
}


export type IdentityRequestMetadata = RequestMetadata;

export type LoyaltyRequestMetadata = RequestMetadata;
