import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { AppConfigService } from 'libs/config';
import { AppLogger } from 'libs/common/logger';
import { S3_CLIENT } from 'libs/object-storage/aws/s3/aws.constants';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CompleteMultipartUploadPartDto,
  CompleteMultipartVideoUploadDto,
  CompleteMultipartVideoUploadResultDto,
  InitMultipartVideoUploadDto,
  InitMultipartVideoUploadResultDto,
  PresignedUploadPartDto,
} from './dtos/video.dto';
import {
  Prisma,
  VideoUploadStatus,
} from 'libs/prisma/generated/nutrition-service/client';
import { VideoQueueService } from './queue/video-queue.service';

const DEFAULT_PART_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_MULTIPART_PART_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_MULTIPART_PARTS = 10_000;
const DEFAULT_PRESIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

@Injectable()
export class VideoService {
  constructor(
    @Inject(S3_CLIENT)
    private readonly s3: S3Client,
    private readonly configService: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly videoQueueService: VideoQueueService,
  ) {}

  async initMultipartUpload(
    dto: InitMultipartVideoUploadDto,
  ): Promise<InitMultipartVideoUploadResultDto> {
    const videoAssetId = randomUUID();
    const bucket = this.configService.getOrThrow<string>('objectStorage.bucket');
    const key = this.buildSourceKey(videoAssetId, dto.fileName);
    const partSizeBytes = dto.partSizeBytes ?? DEFAULT_PART_SIZE_BYTES;
    const totalParts = Math.ceil(dto.fileSizeBytes / partSizeBytes);
    const expiresInSeconds =
      dto.expiresInSeconds ?? DEFAULT_PRESIGNED_URL_EXPIRES_IN_SECONDS;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const metadata = dto.metadata?.custom as Prisma.InputJsonValue | undefined;

    this.validateMultipartPlan(partSizeBytes, totalParts);

    const multipartUploadId = await this.createS3MultipartUpload({
      bucket,
      key,
      contentType: dto.contentType,
      videoAssetId,
      fileName: dto.fileName,
    });

    try {
      const uploadSession = await this.prisma.$transaction(async (tx) => {
        const videoAsset = await tx.videoAsset.create({
          data: {
            id: videoAssetId,
            ownerId: dto.ownerId,
            status: VideoUploadStatus.UPLOADING,
            durationMs: dto.metadata?.durationMs,
            width: dto.metadata?.width,
            height: dto.metadata?.height,
            sizeBytes: BigInt(dto.fileSizeBytes),
            mimeType: dto.contentType,
            metadata,
          },
        });

        if (dto.recipeId) {
          const updateResult = await tx.recipe.updateMany({
            where: {
              id: dto.recipeId,
              videoAssetId: dto.expectedVideoAssetId ?? null,
            },
            data: {
              videoAssetId: videoAsset.id,
            },
          });

          if (updateResult.count !== 1) {
            const recipe = await tx.recipe.findUnique({
              where: { id: dto.recipeId },
              select: { videoAssetId: true },
            });

            if (!recipe) {
              throw new NotFoundException(
                `Recipe with id "${dto.recipeId}" not found`,
              );
            }

            throw new ConflictException(
              'Recipe video was changed by another request',
            );
          }
        }

        return tx.videoUploadSession.create({
          data: {
            videoAssetId: videoAsset.id,
            bucket,
            key,
            multipartUploadId,
            status: VideoUploadStatus.UPLOADING,
            totalParts,
            partSizeBytes,
            expiresAt,
            parts: {
              createMany: {
                data: Array.from({ length: totalParts }, (_, index) => ({
                  partNumber: index + 1,
                  sizeBytes: this.getPartSizeBytes(
                    dto.fileSizeBytes,
                    partSizeBytes,
                    index + 1,
                    totalParts,
                  ),
                })),
              },
            },
          },
        });
      });

      const parts = await this.createPresignedUploadPartUrls({
        bucket,
        key,
        multipartUploadId,
        totalParts,
        expiresInSeconds,
        expiresAt,
      });

      return {
        videoAssetId,
        uploadSessionId: uploadSession.id,
        bucket,
        key,
        multipartUploadId,
        partSizeBytes,
        totalParts,
        expiresAt,
        parts,
      };
    } catch (error) {
      await this.abortS3MultipartUpload(bucket, key, multipartUploadId);
      this.logger.error('Failed to initialize video multipart upload', error);
      throw error;
    }
  }

  async completeMultipartUpload(
    dto: CompleteMultipartVideoUploadDto,
  ): Promise<CompleteMultipartVideoUploadResultDto> {
    const uploadSession = await this.prisma.videoUploadSession.findUnique({
      where: { id: dto.uploadSessionId },
      include: {
        videoAsset: true,
        parts: {
          select: {
            partNumber: true,
          },
        },
      },
    });

    if (!uploadSession) {
      throw new NotFoundException(
        `Video upload session with id "${dto.uploadSessionId}" not found`,
      );
    }

    if (!uploadSession.multipartUploadId) {
      throw new BadRequestException('Multipart upload id is missing');
    }

    if (uploadSession.status !== VideoUploadStatus.UPLOADING) {
      throw new ConflictException('Video upload session is not uploading');
    }

    const parts = this.normalizeCompletedParts(
      dto.parts,
      uploadSession.totalParts ?? uploadSession.parts.length,
    );

    const response = await this.s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: uploadSession.bucket,
        Key: uploadSession.key,
        UploadId: uploadSession.multipartUploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            PartNumber: part.partNumber,
            ETag: part.etag,
          })),
        },
      }),
    );

    const url =
      response.Location ?? this.getPublicUrl(uploadSession.bucket, uploadSession.key);
    const finalizeJob =
      await this.videoQueueService.enqueueFinalizeMultipartUpload({
        uploadSessionId: uploadSession.id,
        parts,
        sourceObject: {
          url,
          etag: response.ETag,
        },
    });

    return {
      videoAssetId: uploadSession.videoAssetId,
      uploadSessionId: uploadSession.id,
      bucket: uploadSession.bucket,
      key: uploadSession.key,
      url,
      etag: response.ETag,
      finalizeJobId: finalizeJob.id,
    };
  }

  private async createS3MultipartUpload(params: {
    bucket: string;
    key: string;
    contentType: string;
    videoAssetId: string;
    fileName: string;
  }): Promise<string> {
    const response = await this.s3.send(
      new CreateMultipartUploadCommand({
        Bucket: params.bucket,
        Key: params.key,
        ContentType: params.contentType,
        Metadata: {
          videoAssetId: params.videoAssetId,
          originalFileName: params.fileName,
        },
      }),
    );

    if (!response.UploadId) {
      throw new InternalServerErrorException(
        'S3 did not return multipart upload id',
      );
    }

    return response.UploadId;
  }

  private async abortS3MultipartUpload(
    bucket: string,
    key: string,
    multipartUploadId: string,
  ): Promise<void> {
    try {
      await this.s3.send(
        new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: multipartUploadId,
        }),
      );
    } catch (error) {
      this.logger.warn('Failed to abort S3 multipart upload', {
        bucket,
        key,
        multipartUploadId,
        error,
      });
    }
  }

  private async createPresignedUploadPartUrls(params: {
    bucket: string;
    key: string;
    multipartUploadId: string;
    totalParts: number;
    expiresInSeconds: number;
    expiresAt: Date;
  }): Promise<PresignedUploadPartDto[]> {
    return Promise.all(
      Array.from({ length: params.totalParts }, async (_, index) => {
        const partNumber = index + 1;
        const command = new UploadPartCommand({
          Bucket: params.bucket,
          Key: params.key,
          UploadId: params.multipartUploadId,
          PartNumber: partNumber,
        });

        return {
          partNumber,
          signedUrl: await getSignedUrl(this.s3, command, {
            expiresIn: params.expiresInSeconds,
          }),
          expiresAt: params.expiresAt,
        };
      }),
    );
  }

  private validateMultipartPlan(partSizeBytes: number, totalParts: number) {
    if (partSizeBytes < MIN_MULTIPART_PART_SIZE_BYTES) {
      throw new BadRequestException(
        `partSizeBytes must be at least ${MIN_MULTIPART_PART_SIZE_BYTES}`,
      );
    }

    if (totalParts > MAX_MULTIPART_PARTS) {
      throw new BadRequestException(
        `Multipart upload cannot exceed ${MAX_MULTIPART_PARTS} parts`,
      );
    }
  }

  private normalizeCompletedParts(
    parts: CompleteMultipartUploadPartDto[],
    expectedTotalParts: number,
  ): CompleteMultipartUploadPartDto[] {
    if (parts.length !== expectedTotalParts) {
      throw new BadRequestException(
        `Expected ${expectedTotalParts} completed parts, received ${parts.length}`,
      );
    }

    const seenPartNumbers = new Set<number>();

    for (const part of parts) {
      if (part.partNumber > expectedTotalParts) {
        throw new BadRequestException(
          `Part number ${part.partNumber} exceeds total parts ${expectedTotalParts}`,
        );
      }

      if (seenPartNumbers.has(part.partNumber)) {
        throw new BadRequestException(
          `Duplicate part number ${part.partNumber}`,
        );
      }

      seenPartNumbers.add(part.partNumber);
    }

    return [...parts].sort((a, b) => a.partNumber - b.partNumber);
  }

  private getPartSizeBytes(
    fileSizeBytes: number,
    partSizeBytes: number,
    partNumber: number,
    totalParts: number,
  ): number {
    if (partNumber < totalParts) {
      return partSizeBytes;
    }

    return fileSizeBytes - partSizeBytes * (totalParts - 1);
  }

  private buildSourceKey(videoAssetId: string, fileName: string): string {
    return `uploads/videos/${videoAssetId}/${this.sanitizeFileName(fileName)}`;
  }

  private getPublicUrl(bucket: string, key: string): string {
    const region = this.configService.get<string>(
      'objectStorage.region',
      'ap-northeast-2',
    );
    const encodedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .trim()
      .replace(/[/\\]/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 255);
  }
}
