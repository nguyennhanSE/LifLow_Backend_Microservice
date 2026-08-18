import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../../../prisma/prisma.module';
import { VIDEO_QUEUE_NAME } from './video-queue.constant';
import { VideoQueueProcessor } from './video-queue.processor';
import { VideoQueueService } from './video-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    AppQueueModule.registerQueue(VIDEO_QUEUE_NAME),
  ],
  providers: [VideoQueueService, VideoQueueProcessor],
  exports: [VideoQueueService],
})
export class VideoQueueModule {}
