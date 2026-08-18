import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CompleteMultipartVideoUploadDto,
  InitMultipartVideoUploadDto,
} from './dtos/video.dto';
import { VideoService } from './video.service';

@Controller('videos')
@ApiTags('Videos')
@ApiBearerAuth()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('multipart/init')
  initMultipartUpload(@Body() dto: InitMultipartVideoUploadDto) {
    return this.videoService.initMultipartUpload(dto);
  }

  @Post('multipart/complete')
  completeMultipartUpload(@Body() dto: CompleteMultipartVideoUploadDto) {
    return this.videoService.completeMultipartUpload(dto);
  }
}
