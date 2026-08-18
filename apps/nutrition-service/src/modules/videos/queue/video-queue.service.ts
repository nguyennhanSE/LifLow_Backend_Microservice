import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import {
  FinalizeMultipartUploadJobPayload,
  VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB,
  VIDEO_QUEUE_NAME,
} from './video-queue.constant';

@Injectable()
export class VideoQueueService {
  constructor(@InjectQueue(VIDEO_QUEUE_NAME) private readonly videoQueue: Queue) {}

  enqueueFinalizeMultipartUpload(
    payload: FinalizeMultipartUploadJobPayload,
    options?: JobsOptions,
  ) {
    return this.videoQueue.add(VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB, payload, {
      jobId: `${VIDEO_FINALIZE_MULTIPART_UPLOAD_JOB}:${payload.uploadSessionId}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    });
  }
}
