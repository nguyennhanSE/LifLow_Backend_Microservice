import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AwsModule } from 'libs/object-storage/aws/s3/aws.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { VideoQueueModule } from './queue/video-queue.module';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [AwsModule, LoggerModule, PrismaModule, VideoQueueModule],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
