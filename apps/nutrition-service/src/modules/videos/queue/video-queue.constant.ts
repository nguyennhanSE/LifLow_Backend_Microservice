import type { CompleteMultipartUploadPartDto } from '../dtos/video.dto';

export const VIDEO_QUEUE_NAME = 'video-queue';

export const VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB =
  'video-finalize-multipart-upload';

export interface FinalizeMultipartUploadJobPayload {
  uploadSessionId: string;
  parts: CompleteMultipartUploadPartDto[];
  sourceObject: {
    url: string;
    etag?: string;
  };
}
