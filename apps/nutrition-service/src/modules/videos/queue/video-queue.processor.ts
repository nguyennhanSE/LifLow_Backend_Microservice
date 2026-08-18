import { Processor, WorkerHost } from '@nestjs/bullmq';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, relative } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';
import { AppLogger } from 'libs/common/logger';
import { AppConfigService } from 'libs/config';
import { S3_CLIENT } from 'libs/object-storage/aws/s3/aws.constants';
import {
  Prisma,
  VideoUploadPartStatus,
  VideoRenditionStatus,
  VideoUploadStatus,
} from 'libs/prisma/generated/nutrition-service/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  FinalizeMultipartUploadJobPayload,
  TranscodeVideoJobPayload,
  VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB,
  VIDEO_QUEUE_NAME,
  VIDEO_TRANSCODE_JOB,
} from './video-queue.constant';
import { VideoQueueService } from './video-queue.service';

const execFileAsync = promisify(execFile);

type HlsRenditionPreset = {
  name: string;
  width: number;
  height: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
};

type ProbeMetadata = {
  durationMs?: number;
  width?: number;
  height?: number;
};

const HLS_RENDITION_PRESETS: HlsRenditionPreset[] = [
  {
    name: '360p',
    width: 640,
    height: 360,
    videoBitrateKbps: 800,
    audioBitrateKbps: 96,
  },
  {
    name: '480p',
    width: 854,
    height: 480,
    videoBitrateKbps: 1400,
    audioBitrateKbps: 128,
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrateKbps: 2800,
    audioBitrateKbps: 128,
  },
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrateKbps: 5000,
    audioBitrateKbps: 192,
  },
];

@Processor(VIDEO_QUEUE_NAME)
export class VideoQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly videoQueueService: VideoQueueService,
    @Inject(S3_CLIENT)
    private readonly s3: S3Client,
    private readonly configService: AppConfigService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB:
        return this.finalizeMultipartUpload(
          job as Job<FinalizeMultipartUploadJobPayload>,
        );
      
      case VIDEO_TRANSCODE_JOB:
        return this.enqueueTranscodeVideo(
          job as Job<TranscodeVideoJobPayload>,
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
    
    await this.videoQueueService.enqueueTranscodeVideo({
      videoAssetId: uploadSession.videoAssetId,
      targetFormat: 'hls',
    });

    return {
      uploadSessionId: uploadSession.id,
      videoAssetId: uploadSession.videoAssetId,
      sourceObjectId: finalizedObject.id,
      finalized: true,
    };
  }

  private async enqueueTranscodeVideo(
    job: Job<TranscodeVideoJobPayload>,
  ) {
    const { videoAssetId, targetFormat } = job.data;

    if (targetFormat !== 'hls') {
      this.logger.warn(
        `[VideoQueue] Unsupported transcode target=${targetFormat}, videoAsset=${videoAssetId}`,
      );
      return { skipped: true };
    }

    const workspace = join(tmpdir(), 'liflow-video', videoAssetId);
    const inputPath = join(workspace, 'source', 'input');
    const hlsOutputDir = join(workspace, 'hls');

    try {
      const videoAsset = await this.prisma.videoAsset.findUnique({
        where: { id: videoAssetId },
        include: {
          sourceObject: true,
        },
      });

      if (!videoAsset?.sourceObject) {
        throw new Error(
          `[VideoQueue] Video source object not found: ${videoAssetId}`,
        );
      }

      await this.prisma.videoAsset.update({
        where: { id: videoAssetId },
        data: {
          status: VideoUploadStatus.PROCESSING,
          errorMessage: null,
        },
      });

      await rm(workspace, { recursive: true, force: true });
      await mkdir(join(workspace, 'source'), { recursive: true });
      await mkdir(hlsOutputDir, { recursive: true });

      await this.downloadS3Object(
        videoAsset.sourceObject.bucket,
        videoAsset.sourceObject.key,
        inputPath,
      );

      const probe = await this.probeVideo(inputPath);
      const renditions = this.selectHlsRenditions(probe);

      await Promise.all(
        renditions.map((rendition) =>
          this.transcodeHlsRendition(inputPath, hlsOutputDir, rendition),
        ),
      );

      await this.writeHlsMasterPlaylist(hlsOutputDir, renditions);

      const bucket = this.configService.getOrThrow<string>(
        'objectStorage.bucket',
      );
      const hlsPrefix = `videos/${videoAssetId}/hls`;
      const uploadedObjects = await this.uploadDirectoryToS3(
        bucket,
        hlsPrefix,
        hlsOutputDir,
      );
      const masterKey = `${hlsPrefix}/master.m3u8`;
      const masterUrl = this.getPublicUrl(bucket, masterKey);

      await this.prisma.$transaction(async (tx) => {
        const masterObject = await tx.awsS3Object.upsert({
          where: {
            bucket_key: {
              bucket,
              key: masterKey,
            },
          },
          create: {
            bucket,
            key: masterKey,
            url: masterUrl,
            contentType: this.getContentType(masterKey),
            metadata: {
              videoAssetId,
              targetFormat,
              renditions: renditions.map((rendition) => rendition.name),
            } as Prisma.InputJsonValue,
          },
          update: {
            url: masterUrl,
            contentType: this.getContentType(masterKey),
            metadata: {
              videoAssetId,
              targetFormat,
              renditions: renditions.map((rendition) => rendition.name),
            } as Prisma.InputJsonValue,
          },
        });

        for (const rendition of renditions) {
          const playlistKey = `${hlsPrefix}/${rendition.name}/index.m3u8`;
          const playlistUrl = this.getPublicUrl(bucket, playlistKey);
          const playlistObject = await tx.awsS3Object.upsert({
            where: {
              bucket_key: {
                bucket,
                key: playlistKey,
              },
            },
            create: {
              bucket,
              key: playlistKey,
              url: playlistUrl,
              contentType: this.getContentType(playlistKey),
              metadata: {
                videoAssetId,
                rendition: rendition.name,
              } as Prisma.InputJsonValue,
            },
            update: {
              url: playlistUrl,
              contentType: this.getContentType(playlistKey),
              metadata: {
                videoAssetId,
                rendition: rendition.name,
              } as Prisma.InputJsonValue,
            },
          });

          await tx.videoRendition.upsert({
            where: {
              videoAssetId_bitrateKbps: {
                videoAssetId,
                bitrateKbps: rendition.videoBitrateKbps,
              },
            },
            create: {
              videoAssetId,
              status: VideoRenditionStatus.READY,
              objectId: playlistObject.id,
              bitrateKbps: rendition.videoBitrateKbps,
              width: rendition.width,
              height: rendition.height,
              playlistUrl,
              segmentPrefix: `${hlsPrefix}/${rendition.name}/`,
            },
            update: {
              status: VideoRenditionStatus.READY,
              objectId: playlistObject.id,
              width: rendition.width,
              height: rendition.height,
              playlistUrl,
              segmentPrefix: `${hlsPrefix}/${rendition.name}/`,
            },
          });
        }

        await tx.videoAsset.update({
          where: { id: videoAssetId },
          data: {
            status: VideoUploadStatus.READY,
            hlsMasterObjectId: masterObject.id,
            playbackUrl: masterUrl,
            durationMs: probe.durationMs ?? videoAsset.durationMs,
            width: probe.width ?? videoAsset.width,
            height: probe.height ?? videoAsset.height,
            metadata: {
              ...(typeof videoAsset.metadata === 'object' &&
              videoAsset.metadata &&
              !Array.isArray(videoAsset.metadata)
                ? videoAsset.metadata
                : {}),
              hlsPrefix,
              uploadedHlsObjects: uploadedObjects.length,
            } as Prisma.InputJsonValue,
          },
        });
      });

      this.logger.log(
        `[VideoQueue] HLS transcode completed for videoAsset=${videoAssetId}, renditions=${renditions.map((rendition) => rendition.name).join(',')}`,
      );

      return {
        videoAssetId,
        targetFormat,
        playbackUrl: masterUrl,
        renditions: renditions.map((rendition) => rendition.name),
      };
    } catch (error) {
      await this.prisma.videoAsset
        .update({
          where: { id: videoAssetId },
          data: {
            status: VideoUploadStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : String(error),
          },
        })
        .catch(() => undefined);

      throw error;
    } finally {
      await rm(workspace, { recursive: true, force: true }).catch(
        () => undefined,
      );
    }
  }

  private async downloadS3Object(
    bucket: string,
    key: string,
    destinationPath: string,
  ): Promise<void> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`[VideoQueue] S3 object body is empty: ${bucket}/${key}`);
    }

    if (response.Body instanceof Readable) {
      await pipeline(response.Body, createWriteStream(destinationPath));
      return;
    }

    const body = response.Body as {
      transformToByteArray?: () => Promise<Uint8Array>;
    };

    if (body.transformToByteArray) {
      await writeFile(destinationPath, Buffer.from(await body.transformToByteArray()));
      return;
    }

    throw new Error(`[VideoQueue] Unsupported S3 body type: ${bucket}/${key}`);
  }

  private async probeVideo(inputPath: string): Promise<ProbeMetadata> {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_streams',
      '-show_format',
      inputPath,
    ]);
    const probe = JSON.parse(stdout) as {
      streams?: Array<{
        codec_type?: string;
        width?: number;
        height?: number;
        duration?: string;
      }>;
      format?: {
        duration?: string;
      };
    };
    const videoStream = probe.streams?.find(
      (stream) => stream.codec_type === 'video',
    );
    const durationSeconds = Number(
      probe.format?.duration ?? videoStream?.duration ?? 0,
    );

    return {
      durationMs: durationSeconds ? Math.round(durationSeconds * 1000) : undefined,
      width: videoStream?.width,
      height: videoStream?.height,
    };
  }

  private selectHlsRenditions(probe: ProbeMetadata): HlsRenditionPreset[] {
    if (!probe.height) {
      return HLS_RENDITION_PRESETS.slice(0, 3);
    }

    const renditions = HLS_RENDITION_PRESETS.filter(
      (rendition) => rendition.height <= probe.height!,
    );

    return renditions.length ? renditions : [HLS_RENDITION_PRESETS[0]];
  }

  private async transcodeHlsRendition(
    inputPath: string,
    outputDir: string,
    rendition: HlsRenditionPreset,
  ): Promise<void> {
    const renditionDir = join(outputDir, rendition.name);
    await mkdir(renditionDir, { recursive: true });

    await execFileAsync('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-vf',
      `scale=w=${rendition.width}:h=${rendition.height}:force_original_aspect_ratio=decrease,pad=${rendition.width}:${rendition.height}:(ow-iw)/2:(oh-ih)/2`,
      '-c:v',
      'h264',
      '-preset',
      'veryfast',
      '-profile:v',
      'main',
      '-crf',
      '20',
      '-maxrate',
      `${rendition.videoBitrateKbps}k`,
      '-bufsize',
      `${rendition.videoBitrateKbps * 2}k`,
      '-c:a',
      'aac',
      '-b:a',
      `${rendition.audioBitrateKbps}k`,
      '-ac',
      '2',
      '-hls_time',
      '6',
      '-hls_playlist_type',
      'vod',
      '-hls_segment_filename',
      join(renditionDir, 'segment_%03d.ts'),
      join(renditionDir, 'index.m3u8'),
    ]);
  }

  private async writeHlsMasterPlaylist(
    outputDir: string,
    renditions: HlsRenditionPreset[],
  ): Promise<void> {
    const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];

    for (const rendition of renditions) {
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${(rendition.videoBitrateKbps + rendition.audioBitrateKbps) * 1000},RESOLUTION=${rendition.width}x${rendition.height}`,
        `${rendition.name}/index.m3u8`,
      );
    }

    await writeFile(join(outputDir, 'master.m3u8'), `${lines.join('\n')}\n`);
  }

  private async uploadDirectoryToS3(
    bucket: string,
    keyPrefix: string,
    directory: string,
  ): Promise<string[]> {
    const filePaths = await this.listFiles(directory);

    await Promise.all(
      filePaths.map(async (filePath) => {
        const relativePath = relative(directory, filePath).replace(/\\/g, '/');
        const key = `${keyPrefix}/${relativePath}`;
        await this.s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: await readFile(filePath),
            ContentType: this.getContentType(key),
            CacheControl: 'public, max-age=31536000',
          }),
        );
      }),
    ).catch((error) => {
      this.logger.error(
        `[VideoQueue] Failed to upload directory to S3: ${bucket}/${keyPrefix}`,
        error,
      );
      throw error;
    });
    return filePaths;
  }

  private async listFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          return this.listFiles(path);
        }

        if (entry.isFile()) {
          return [path];
        }

        return [];
      }),
    );

    return files.flat();
  }

  private getContentType(key: string): string {
    const extension = extname(key).toLowerCase();

    if (extension === '.m3u8') {
      return 'application/vnd.apple.mpegurl';
    }

    if (extension === '.ts') {
      return 'video/mp2t';
    }

    if (extension === '.mp4') {
      return 'video/mp4';
    }

    return 'application/octet-stream';
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
}
