import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppConfigModule } from 'libs/config';
import { AwsModule } from 'libs/object-storage/aws/s3/aws.module';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../../../prisma/prisma.module';
import { VIDEO_QUEUE_NAME } from './video-queue.constant';
import { VideoQueueProcessor } from './video-queue.processor';
import { VideoQueueService } from './video-queue.service';

@Module({
  imports: [
    AppConfigModule.forFeature([]),
    LoggerModule,
    PrismaModule,
    AwsModule,
    AppQueueModule.registerQueue(VIDEO_QUEUE_NAME),
  ],
  providers: [VideoQueueService, VideoQueueProcessor],
  exports: [VideoQueueService],
})
export class VideoQueueModule {}
