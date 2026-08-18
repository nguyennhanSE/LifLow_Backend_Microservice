import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMimeType,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class VideoMetadataDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height?: number;

  @IsOptional()
  @IsObject()
  custom?: Record<string, unknown>;
}

export class InitMultipartVideoUploadDto {
  @IsOptional()
  @IsUUID('4')
  recipeId?: string;

  @IsOptional()
  @IsUUID('4')
  expectedVideoAssetId?: string | null;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @IsMimeType()
  contentType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  fileSizeBytes!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5 * 1024 * 1024)
  @Max(5 * 1024 * 1024 * 1024)
  partSizeBytes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(60 * 60 * 24)
  expiresInSeconds?: number;

  @IsOptional()
  @Type(() => VideoMetadataDto)
  metadata?: VideoMetadataDto;
}

export class PresignedUploadPartDto {
  partNumber!: number;
  signedUrl!: string;
  expiresAt!: Date;
}

export class InitMultipartVideoUploadResultDto {
  videoAssetId!: string;
  uploadSessionId!: string;
  bucket!: string;
  key!: string;
  multipartUploadId!: string;
  partSizeBytes!: number;
  totalParts!: number;
  expiresAt!: Date;
  parts!: PresignedUploadPartDto[];
}

export class CompleteMultipartUploadPartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  partNumber!: number;

  @IsString()
  @IsNotEmpty()
  etag!: string;
}

export class CompleteMultipartVideoUploadDto {
  @IsUUID('4')
  uploadSessionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompleteMultipartUploadPartDto)
  parts!: CompleteMultipartUploadPartDto[];
}

export class CompleteMultipartVideoUploadResultDto {
  videoAssetId!: string;
  uploadSessionId!: string;
  bucket!: string;
  key!: string;
  url!: string;
  etag?: string;
  finalizeJobId?: string | number;
}
