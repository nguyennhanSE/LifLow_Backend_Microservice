import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFileDto, UploadObjectDto } from './dto/aws.dto';
import type { UploadedFileObject } from './dto/aws.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('aws')
@ApiTags('AWS')
@ApiBearerAuth()
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('objects')
  uploadObject(@Body() dto: UploadObjectDto) {
    return this.awsService.uploadObject(dto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Body('prefix') prefix: string,
    @Body('id') id: string,
    @UploadedFile() file: UploadedFileObject,
  ) {
    return this.awsService.uploadFile(prefix, id, file);
  }

  @Delete('objects')
  delete(@Query('key') key: string) {
    return this.awsService.deleteObject(key);
  }

  @Get('objects/public-url')
  getPublicUrl(@Query('key') key: string) {
    return this.awsService.getPublicUrl(key);
  }
}
