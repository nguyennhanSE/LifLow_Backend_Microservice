import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { TokenType } from '../../enums';

export interface IdentityRequestMetadata {
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  traceId: string | null;
}

export interface IdentityRequestPayload<TData> {
  data: TData;
  metadata?: IdentityRequestMetadata;
}

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ip?: string;
}

export interface RefreshTokenDto {
  id: string;
  refreshToken: string;
  ip?: string;
}

export interface ValidateTokenDto {
  accessToken: string;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  username?: string;
  tokenType: TokenType;
  roles: string[];
  iat?: number;
  exp?: number;
}
