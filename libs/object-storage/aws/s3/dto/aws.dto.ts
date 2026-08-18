import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type UploadedFileObject = {
  buffer?: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
};

export class UploadObjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'S3 object key' })
  key!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Object content' })
  body!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Object content type' })
  contentType?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Return a public URL in response' })
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'S3 Cache-Control header' })
  cacheControl?: string;
}

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'S3 prefix/folder' })
  prefix!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Entity id used in the object key' })
  id!: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file!: UploadedFileObject;
}
