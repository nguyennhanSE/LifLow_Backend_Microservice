import type { Prisma } from 'libs/prisma/generated/nutrition-service/client';
import type { VideoAssetEntity } from './video-asset.entity';
import type { VideoRenditionEntity } from './video-rendition.entity';

export class AwsS3ObjectEntity {
  id!: string;
  bucket!: string;
  key!: string;
  url!: string;
  contentType?: string | null;
  sizeBytes?: bigint | null;
  etag?: string | null;
  metadata?: Prisma.JsonValue | null;
  createdAt!: Date;
  updatedAt!: Date;

  videoSources?: VideoAssetEntity[];
  hlsMasters?: VideoAssetEntity[];
  renditions?: VideoRenditionEntity[];
}
