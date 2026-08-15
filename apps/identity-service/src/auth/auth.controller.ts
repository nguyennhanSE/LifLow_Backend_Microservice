import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
  ValidateTokenDto,
} from './dtos/auth.dto';

import { IDENTITY_AUTH_PATTERNS } from './patterns/auth.pattern';
import { AuthService } from './auth.service';
import type { IdentityRequestPayload } from '../common';

@Controller()
export class AuthController {
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
