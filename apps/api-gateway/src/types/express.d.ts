import type { RequestMetadata } from '../metadata/client.metadata';

declare global {
  namespace Express {
    interface Request {
      metadata: RequestMetadata;
    }
  }
}
