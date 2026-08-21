import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
  ValidateTokenDto,
} from '../../modules/auth/dtos/auth.dto';

import { AuthService } from '../../modules/auth/auth.service';
import type { IdentityRequestPayload } from '../../common';
import { IDENTITY_AUTH_PATTERNS } from './auth.pattern';

@Controller()
export class AuthMessagingController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(IDENTITY_AUTH_PATTERNS.login)
  login(@Payload() payload: IdentityRequestPayload<LoginDto>) {
    return this.authService.login({
      ...payload.data,
    });
  }

  @MessagePattern(IDENTITY_AUTH_PATTERNS.logout)
  logout(@Payload() payload: IdentityRequestPayload<LogoutDto>) {
    return this.authService.logout(payload.data);
  }

  @MessagePattern(IDENTITY_AUTH_PATTERNS.refreshToken)
  refreshToken(
    @Payload() payload: IdentityRequestPayload<RefreshTokenRequestDto>,
  ) {
    return this.authService.refreshToken({
      ...payload.data,
    });
  }

  @MessagePattern(IDENTITY_AUTH_PATTERNS.validateToken)
  validateToken(@Payload() payload: IdentityRequestPayload<ValidateTokenDto>) {
    return this.authService.validateToken(payload.data.accessToken);
  }
}
