import type { RequestMetadata } from '../clients/metadata/client.metadata';

declare global {
  namespace Express {
    interface Request {
      metadata: RequestMetadata;
    }
  }
}
