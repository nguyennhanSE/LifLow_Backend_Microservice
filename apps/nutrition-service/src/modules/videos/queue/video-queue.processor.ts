import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AppLogger } from 'libs/common/logger';
import {
  Prisma,
  VideoUploadPartStatus,
  VideoUploadStatus,
} from 'libs/prisma/generated/nutrition-service/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  FinalizeMultipartUploadJobPayload,
  VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB,
  VIDEO_QUEUE_NAME,
} from './video-queue.constant';

@Processor(VIDEO_QUEUE_NAME)
export class VideoQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB:
        return this.finalizeMultipartUpload(
          job as Job<FinalizeMultipartUploadJobPayload>,
        );

      default:
        this.logger.warn(`[VideoQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private async finalizeMultipartUpload(
    job: Job<FinalizeMultipartUploadJobPayload>,
  ) {
    const { uploadSessionId, parts, sourceObject } = job.data;

    const uploadSession = await this.prisma.videoUploadSession.findUnique({
      where: { id: uploadSessionId },
      include: {
        videoAsset: true,
      },
    });

    if (!uploadSession) {
      throw new Error(
        `[VideoQueue] Video upload session not found: ${uploadSessionId}`,
      );
    }

    const objectMetadata = {
      multipartUploadId: uploadSession.multipartUploadId,
      finalizedJobId: job.id,
    } as Prisma.InputJsonValue;

    const finalizedObject = await this.prisma.$transaction(async (tx) => {
      const s3Object = await tx.awsS3Object.upsert({
        where: {
          bucket_key: {
            bucket: uploadSession.bucket,
            key: uploadSession.key,
          },
        },
        create: {
          bucket: uploadSession.bucket,
          key: uploadSession.key,
          url: sourceObject.url,
          contentType: uploadSession.videoAsset.mimeType,
          sizeBytes: uploadSession.videoAsset.sizeBytes,
          etag: sourceObject.etag,
          metadata: objectMetadata,
        },
        update: {
          url: sourceObject.url,
          contentType: uploadSession.videoAsset.mimeType,
          sizeBytes: uploadSession.videoAsset.sizeBytes,
          etag: sourceObject.etag,
          metadata: objectMetadata,
        },
      });

      await Promise.all(
        parts.map((part) =>
          tx.videoUploadPart.update({
            where: {
              videoUploadSessionId_partNumber: {
                videoUploadSessionId: uploadSession.id,
                partNumber: part.partNumber,
              },
            },
            data: {
              etag: part.etag,
              status: VideoUploadPartStatus.UPLOADED,
              uploadedAt: new Date(),
            },
          }),
        ),
      );

      await tx.videoUploadSession.update({
        where: { id: uploadSession.id },
        data: {
          status: VideoUploadStatus.UPLOADED,
          completedAt: new Date(),
        },
      });

      await tx.videoAsset.update({
        where: { id: uploadSession.videoAssetId },
        data: {
          status: VideoUploadStatus.UPLOADED,
          sourceObjectId: s3Object.id,
        },
      });

      return s3Object;
    });

    this.logger.log(
      `[VideoQueue] Finalized multipart upload session=${uploadSession.id}, object=${finalizedObject.id}`,
    );

    return {
      uploadSessionId: uploadSession.id,
      videoAssetId: uploadSession.videoAssetId,
      sourceObjectId: finalizedObject.id,
      finalized: true,
    };
  }
}
