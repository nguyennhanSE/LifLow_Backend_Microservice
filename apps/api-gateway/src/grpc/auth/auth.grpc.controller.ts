import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
} from '../../routes/auth/dtos/auth.dto';
import { AuthGrpcService } from './auth.grpc.service';
import type {
  ApiGatewayGrpcRequestPayload,
  ValidateTokenDto,
} from './auth.grpc.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authGrpcService: AuthGrpcService) {}

  @GrpcMethod('ApiGatewayAuthGrpcService', 'Login')
  login(@Payload() payload: ApiGatewayGrpcRequestPayload<LoginDto>) {
    return this.authGrpcService.login(payload.data, payload.metadata);
  }

  @GrpcMethod('ApiGatewayAuthGrpcService', 'Logout')
  logout(@Payload() payload: ApiGatewayGrpcRequestPayload<LogoutDto>) {
    return this.authGrpcService.logout(payload.data, payload.metadata);
  }

  @GrpcMethod('ApiGatewayAuthGrpcService', 'RefreshToken')
  refreshToken(
    @Payload() payload: ApiGatewayGrpcRequestPayload<RefreshTokenRequestDto>,
  ) {
    return this.authGrpcService.refreshToken(payload.data, payload.metadata);
  }

  @GrpcMethod('ApiGatewayAuthGrpcService', 'ValidateToken')
  validateToken(
    @Payload() payload: ApiGatewayGrpcRequestPayload<ValidateTokenDto>,
  ) {
    return this.authGrpcService.validateToken(payload.data, payload.metadata);
  }
}
