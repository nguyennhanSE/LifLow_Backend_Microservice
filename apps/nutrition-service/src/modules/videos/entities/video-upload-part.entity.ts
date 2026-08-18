import type { VideoUploadPartStatus } from 'libs/prisma/generated/nutrition-service/client';
import type { VideoUploadSessionEntity } from './video-upload-session.entity';

export class VideoUploadPartEntity {
  id!: string;
  videoUploadSessionId!: string;

  partNumber!: number;
  etag?: string | null;
  sizeBytes?: number | null;
  status!: VideoUploadPartStatus;
  uploadedAt?: Date | null;

  createdAt!: Date;
  updatedAt!: Date;

  videoUploadSession?: VideoUploadSessionEntity;
}
