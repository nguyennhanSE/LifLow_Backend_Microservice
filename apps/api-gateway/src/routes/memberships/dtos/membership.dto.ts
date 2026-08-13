import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EMembershipStatus } from 'apps/api-gateway/src/enums';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { trim } from 'libs/utils/helper';

const toOptionalNumber = ({ value }: { value: unknown }): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return Number(value);
};

export class CreateMembershipDto {
  @ApiProperty({
    description: 'Unique membership name',
    example: 'VIP',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @trim()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Membership nickname',
    example: 'VIP Member',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(100)
  nickName?: string;

  @ApiPropertyOptional({
    description: 'Base period for membership in days',
    example: 365,
    minimum: 0,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  basePeriod?: number;

  @ApiPropertyOptional({
    description: 'Membership description',
    example: 'Premium membership with special privileges',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Minimum purchase amount required for this membership tier',
    example: 500000,
    minimum: 0,
  })
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  minPrice!: number;
}

export class UpdateMembershipDto {
  @ApiPropertyOptional({
    description: 'Unique membership name',
    example: 'VIP',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @trim()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Membership nickname',
    example: 'VIP Member',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(100)
  nickName?: string;

  @ApiPropertyOptional({
    description: 'Base period for membership in days',
    example: 365,
    minimum: 0,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  basePeriod?: number;

  @ApiPropertyOptional({
    description: 'Membership description',
    example: 'Premium membership with special privileges',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Minimum purchase amount required for this membership tier',
    example: 500000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  minPrice?: number;
}

export class AssignMembershipDto {
  @ApiProperty({
    description: 'User ID to assign membership to',
    example: 'user001',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Membership ID to assign',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  membershipId!: string;

  @ApiProperty({
    description: 'Membership start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    description: 'Membership end date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiPropertyOptional({
    description: 'Membership status',
    enum: EMembershipStatus,
    example: EMembershipStatus.NORMAL,
    default: EMembershipStatus.NORMAL,
  })
  @IsOptional()
  @IsEnum(EMembershipStatus, {
    message: 'Status must be one of: normal, inactive, stop',
  })
  status?: EMembershipStatus;
}

export class UpdateUserMembershipDto {
  @ApiPropertyOptional({
    description: 'Membership start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Membership end date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Membership name',
    example: 'VIP',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(100)
  membershipLevel?: string;

  @ApiPropertyOptional({
    description: 'Membership status',
    enum: EMembershipStatus,
    example: EMembershipStatus.NORMAL,
  })
  @IsOptional()
  @IsEnum(EMembershipStatus, {
    message: 'Status must be one of: normal, inactive, stop',
  })
  status?: EMembershipStatus;
}

export class QueryMembershipDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
    enum: ['name', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Search query',
    example: 'VIP',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by membership name',
    example: 'VIP',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(100)
  name?: string;
}

export class QueryUserMembershipsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    enum: ['createdAt', 'startDate', 'endDate', 'status'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'startDate', 'endDate', 'status'])
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'status';

  @ApiPropertyOptional({
    description: 'Filter by membership status',
    enum: EMembershipStatus,
    example: EMembershipStatus.NORMAL,
  })
  @IsOptional()
  @IsEnum(EMembershipStatus)
  status?: EMembershipStatus;

  @ApiPropertyOptional({
    description: 'Filter by membership ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  membershipId?: string;
}

export class BulkUpdateMembershipItemDto {
  @ApiProperty({
    description: 'Membership ID to update',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  membershipId!: string;

  @ApiPropertyOptional({
    description: 'Membership nickname',
    example: 'VIP Member',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @trim()
  @MaxLength(100)
  nickName?: string;

  @ApiPropertyOptional({
    description: 'Minimum purchase amount required for this membership tier',
    example: 500000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Base period for membership in days',
    example: 365,
    minimum: 0,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  basePeriod?: number;
}

export class BulkUpdateMembershipDto {
  @ApiProperty({
    description: 'Array of membership updates',
    type: [BulkUpdateMembershipItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateMembershipItemDto)
  @IsNotEmpty()
  updates!: BulkUpdateMembershipItemDto[];
}
