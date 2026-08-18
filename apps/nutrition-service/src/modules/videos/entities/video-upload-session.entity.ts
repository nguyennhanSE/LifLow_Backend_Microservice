import type { VideoUploadStatus } from 'libs/prisma/generated/nutrition-service/client';
import type { VideoAssetEntity } from './video-asset.entity';
import type { VideoUploadPartEntity } from './video-upload-part.entity';

export class VideoUploadSessionEntity {
  id!: string;
  videoAssetId!: string;
  videoAsset?: VideoAssetEntity;

  bucket!: string;
  key!: string;
  multipartUploadId?: string | null;

  status!: VideoUploadStatus;
  totalParts?: number | null;
  partSizeBytes?: number | null;
  expiresAt?: Date | null;
  completedAt?: Date | null;

  parts?: VideoUploadPartEntity[];

  createdAt!: Date;
  updatedAt!: Date;
}
