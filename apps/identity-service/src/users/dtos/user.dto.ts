import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ERoleName } from '../../roles/enums/role.enum';

const roleFilterOptions = [...Object.values(ERoleName), 'ALL'] as const;
type RoleFilterType = ERoleName | 'ALL';
type AdminListFilterType = Exclude<ERoleName, ERoleName.USER> | 'ALL';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mobilePhoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  phoneNumber!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  statusMessage?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mobilePhoneNumber?: string;

  @IsOptional()
  @IsEnum(ERoleName)
  role?: ERoleName;

  @IsOptional()
  @IsString()
  membershipLevel?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalUsedPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  availablePoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPurchaseAmount?: number;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  statusMessage?: string;

  @IsOptional()
  @IsString()
  avatarURL?: string;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  statusMessage?: string;
}

export class GetUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  counted?: boolean;

  @IsOptional()
  @IsEnum(roleFilterOptions)
  role?: RoleFilterType;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  searchField?: string;
}

export class GetAdminListQueryDto extends GetUsersQueryDto {
  @IsOptional()
  @IsEnum(roleFilterOptions)
  declare role?: AdminListFilterType;
}

export class FindUserIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;
}

export class FindPasswordDto extends FindUserIdDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class UpdatePasswordWithOldDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

export class UpdateUserPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}

export class AssignRolesToUserDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  roleIds!: string[];
}

export interface UserParamPayload {
  id: string;
}

export interface UserAccountPayload {
  account: string;
}

export interface UserEmailPayload {
  email: string;
}

export interface UserIdsPayload {
  ids: string[];
}

export interface UserEmailsPayload {
  emails: string[];
}

export interface UserAccountsPayload {
  accounts: string[];
}

export interface UpdateUserPayload {
  id: string;
  updateUserDto: UpdateUserDto;
}

export interface UserIdPayload {
  userId: string;
}

export interface UpdateMyAvatarPayload {
  userId: string;
  avatarUrl: string;
}

export interface UpdateMyProfilePayload {
  userId: string;
  updateProfileDto: UpdateUserProfileDto;
}

export interface UpdateMyPasswordPayload {
  userId: string;
  updatePasswordDto: UpdatePasswordWithOldDto;
}

export interface UpdateUserPermissionsPayload {
  userId: string;
  permissions: string[];
}

export interface AssignRolesToUserPayload {
  userId: string;
  roleIds: string[];
}

export interface RemoveRoleFromUserPayload {
  userId: string;
  roleId: string;
}

export interface GetUsersByRolePayload {
  roleId: string;
  page?: number;
  limit?: number;
  search?: string;
}
