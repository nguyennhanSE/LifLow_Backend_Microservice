import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum NotificationType {
  ORDER_STATUS = 'ORDER_STATUS',
  COUPON = 'COUPON',
  PROMOTION = 'PROMOTION',
  RECIPE = 'RECIPE',
  GENERAL = 'GENERAL',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Target user ID' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Notification title', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Notification body', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({
    description: 'Notification type',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Custom notification payload' })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class QueryNotificationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
  })
  @IsBoolean()
  isRead?: boolean;
}
