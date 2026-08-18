import type { VideoRenditionStatus } from 'libs/prisma/generated/nutrition-service/client';
import type { AwsS3ObjectEntity } from './aws-s3-object.entity';
import type { VideoAssetEntity } from './video-asset.entity';

export class VideoRenditionEntity {
  id!: string;
  videoAssetId!: string;
  videoAsset?: VideoAssetEntity;

  status!: VideoRenditionStatus;
  objectId?: string | null;
  object?: AwsS3ObjectEntity | null;

  bitrateKbps!: number;
  width!: number;
  height!: number;
  playlistUrl?: string | null;
  segmentPrefix?: string | null;

  createdAt!: Date;
  updatedAt!: Date;
}
