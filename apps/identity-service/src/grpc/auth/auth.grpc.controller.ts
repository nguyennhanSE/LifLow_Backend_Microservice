import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import type { IdentityRequestPayload } from '../../common';
import { AuthService } from '../../modules/auth/auth.service';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
  TokenPayload,
  ValidateTokenDto,
} from '../../modules/auth/dtos/auth.dto';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('IdentityAuthGrpcService', 'Login')
  login(@Payload() payload: IdentityRequestPayload<LoginDto>) {
    return this.authService.login({
      ...payload.data,
    });
  }

  @GrpcMethod('IdentityAuthGrpcService', 'Logout')
  logout(@Payload() payload: IdentityRequestPayload<LogoutDto>) {
    return this.authService.logout(payload.data);
  }

  @GrpcMethod('IdentityAuthGrpcService', 'RefreshToken')
  refreshToken(
    @Payload() payload: IdentityRequestPayload<RefreshTokenRequestDto>,
  ) {
    return this.authService.refreshToken({
      ...payload.data,
    });
  }

  @GrpcMethod('IdentityAuthGrpcService', 'ValidateToken')
  validateToken(@Payload() payload: IdentityRequestPayload<ValidateTokenDto>) {
    return this.authService
      .validateToken(payload.data.accessToken)
      .then((payload) => this.toTokenPayloadResponse(payload));
  }

  private toTokenPayloadResponse(payload: TokenPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      tokenType: payload.tokenType,
      roles: payload.roles,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
