import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[A-Z_]+$/, {
    message: 'Role name must be uppercase with underscores only',
  })
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(/^[A-Z_]+$/, {
    message: 'Role name must be uppercase with underscores only',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class AssignRolesToUserDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  userIds!: string[];
}

export class RoleQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'createdAt'])
  sortBy?: 'name' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface RoleIdPayload {
  id: string;
}

export interface UpdateRolePayload {
  id: string;
  updateRoleDto: UpdateRoleDto;
}

export interface DeleteRolePayload {
  id: string;
  force?: boolean;
}

export interface AssignRoleToUsersPayload {
  id: string;
  assignDto: AssignRolesToUserDto;
}

export interface RevokeRoleFromUserPayload {
  roleId: string;
  userId: string;
}

export interface GetUsersByRolePayload {
  roleId: string;
  page?: number;
  limit?: number;
  search?: string;
}
