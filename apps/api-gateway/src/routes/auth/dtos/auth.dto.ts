import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export interface LoginNaverDto {
  code: string;
}

export interface NaverTokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: string;
  error?: string;
  error_description?: string;
}

export interface NaverProfileInner {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  profile_image?: string;
  [key: string]: unknown;
}

export interface NaverProfileResponse {
  resultcode: string;
  message: string;
  response?: NaverProfileInner;
}

export interface SimpleFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'admin1@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    description: 'User IP address',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ip?: string;

  @ApiPropertyOptional({
    description: 'Remember user session for extended period',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'Refresh token for getting new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @ApiPropertyOptional({
    description: 'User IP address',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ip?: string;
}

export class RefreshTokenDto {
  refreshToken!: string;
  ip?: string;
  id!: string;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Refresh token to revoke',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
