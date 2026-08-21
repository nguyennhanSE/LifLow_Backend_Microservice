import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomDto {}

export class GetRoomsQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: ['lastMessageAt', 'createdAt'],
    default: 'lastMessageAt',
  })
  @IsOptional()
  @IsIn(['lastMessageAt', 'createdAt'])
  sortBy?: 'lastMessageAt' | 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class CreateMessageDto {
  @ApiProperty({ description: 'Room ID', format: 'uuid' })
  @IsUUID()
  roomId!: string;

  @ApiProperty({ description: 'Message content', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}

export class UpdateMessageDto {
  @ApiPropertyOptional({ description: 'Message content', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({ description: 'Message read status' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class QueryMessagesDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Only messages created before this ISO date',
  })
  @IsOptional()
  @IsString()
  before?: string;

  @ApiPropertyOptional({
    description: 'Only messages created after this ISO date',
  })
  @IsOptional()
  @IsString()
  after?: string;
}
