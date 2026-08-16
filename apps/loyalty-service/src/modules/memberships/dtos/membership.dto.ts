import { Type } from 'class-transformer';
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
import { EMembershipStatus } from '../enums/membership.enum';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePeriod?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice!: number;
}

export class UpdateMembershipDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePeriod?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;
}

export class AssignMembershipDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  membershipId!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsOptional()
  @IsEnum(EMembershipStatus)
  status?: EMembershipStatus;
}

export class UpdateUserMembershipDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  membershipLevel?: string;

  @IsOptional()
  @IsEnum(EMembershipStatus)
  status?: EMembershipStatus;
}

export class QueryMembershipDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

export class QueryUserMembershipsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['createdAt', 'startDate', 'endDate', 'status'])
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'status';

  @IsOptional()
  @IsEnum(EMembershipStatus)
  status?: EMembershipStatus;

  @IsOptional()
  @IsUUID()
  membershipId?: string;
}

export class BulkUpdateMembershipItemDto {
  @IsUUID()
  @IsNotEmpty()
  membershipId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePeriod?: number;
}

export class BulkUpdateMembershipDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateMembershipItemDto)
  @IsNotEmpty()
  updates!: BulkUpdateMembershipItemDto[];
}

export interface MembershipIdPayload {
  id: string;
}

export interface UpdateMembershipPayload {
  id: string;
  updateMembershipDto: UpdateMembershipDto;
}

export interface MembershipUsersPayload {
  membershipId: string;
  query: QueryUserMembershipsDto;
}

export interface UserMembershipsPayload {
  userId: string;
  query: QueryUserMembershipsDto;
}

export interface UserIdPayload {
  userId: string;
}

export interface UpdateUserMembershipPayload {
  userId: string;
  updateDto: UpdateUserMembershipDto;
}

export interface RemoveUserMembershipPayload {
  userId: string;
  membershipId: string;
}
