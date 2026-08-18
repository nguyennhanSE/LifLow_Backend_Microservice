import type {
  Prisma,
  VideoUploadStatus,
} from 'libs/prisma/generated/nutrition-service/client';
import type { RecipeEntity } from '../../recipes/entities/recipe.entity';
import type { AwsS3ObjectEntity } from './aws-s3-object.entity';
import type { VideoRenditionEntity } from './video-rendition.entity';
import type { VideoUploadSessionEntity } from './video-upload-session.entity';

export class VideoAssetEntity {
  id!: string;
  ownerId?: string | null;
  status!: VideoUploadStatus;

  sourceObjectId?: string | null;
  sourceObject?: AwsS3ObjectEntity | null;

  hlsMasterObjectId?: string | null;
  hlsMasterObject?: AwsS3ObjectEntity | null;

  playbackUrl?: string | null;
  durationMs?: number | null;
  width?: number | null;
  height?: number | null;
  sizeBytes?: bigint | null;
  mimeType?: string | null;
  errorMessage?: string | null;
  metadata?: Prisma.JsonValue | null;

  recipes?: RecipeEntity[];
  uploadSessions?: VideoUploadSessionEntity[];
  renditions?: VideoRenditionEntity[];

  createdAt!: Date;
  updatedAt!: Date;
}
