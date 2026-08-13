import { Injectable } from '@nestjs/common';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
} from '../../routes/auth/dtos/auth.dto';
import { IdentityRequestMetadata } from '../metadata/client.metadata';
import { IDENTITY_AUTH_PATTERNS } from './identity.pattern';
import { IdentityClientService } from './identity.client.service';

export interface TokenPayload {
  sub: string;
  email?: string;
  username?: string;
  tokenType: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

interface ValidateTokenRequest {
  accessToken: string;
}

@Injectable()
export class IdentityAuthClient {
    constructor(private readonly identityClientService: IdentityClientService) {}
    login(loginDto: LoginDto, metadata?: IdentityRequestMetadata) {
        return this.identityClientService.send<LoginDto>(
            IDENTITY_AUTH_PATTERNS.login,
            { data: loginDto, metadata },
        );
    }

    logout(logoutDto: LogoutDto, metadata?: IdentityRequestMetadata) {
        return this.identityClientService.send<LogoutDto>(
            IDENTITY_AUTH_PATTERNS.logout,
            { data: logoutDto, metadata },
        );
    }

    refreshToken(
        refreshTokenRequestDto: RefreshTokenRequestDto,
        metadata?: IdentityRequestMetadata,
    ) {
        return this.identityClientService.send<RefreshTokenRequestDto>(
            IDENTITY_AUTH_PATTERNS.refreshToken,
            { data: refreshTokenRequestDto, metadata },
        );
    }
    validateToken(token: string, metadata?: IdentityRequestMetadata) {
        return this.identityClientService.send<ValidateTokenRequest>(
            IDENTITY_AUTH_PATTERNS.validateToken,
            { data: { accessToken: token }, metadata },
        );
    }
}
