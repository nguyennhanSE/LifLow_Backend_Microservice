import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AppConfigService } from 'libs/config';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import type { RequestMetadata } from '../../metadata/client.metadata';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
} from '../../routes/auth/dtos/auth.dto';

export const IDENTITY_AUTH_GRPC_CLIENT = 'IDENTITY_AUTH_GRPC_CLIENT';

export interface ApiGatewayGrpcRequestPayload<TData> {
  data: TData;
  metadata?: RequestMetadata;
}

export interface ValidateTokenDto {
  accessToken: string;
}

interface IdentityAuthGrpcClient {
  login(payload: ApiGatewayGrpcRequestPayload<LoginDto>): Observable<unknown>;
  logout(payload: ApiGatewayGrpcRequestPayload<LogoutDto>): Observable<unknown>;
  refreshToken(
    payload: ApiGatewayGrpcRequestPayload<RefreshTokenRequestDto>,
  ): Observable<unknown>;
  validateToken(
    payload: ApiGatewayGrpcRequestPayload<ValidateTokenDto>,
  ): Observable<unknown>;
}

@Injectable()
export class AuthGrpcService implements OnModuleInit {
  private identityAuthService!: IdentityAuthGrpcClient;
  private readonly timeoutMs: number;

  constructor(
    @Inject(IDENTITY_AUTH_GRPC_CLIENT)
    private readonly identityAuthGrpcClient: ClientGrpc,
    private readonly configService: AppConfigService,
  ) {
    this.timeoutMs = this.configService.get<number>(
      'apiGateway.downstreams.identity.timeoutMs',
      5000,
    );
  }

  onModuleInit() {
    this.identityAuthService =
      this.identityAuthGrpcClient.getService<IdentityAuthGrpcClient>(
        'IdentityAuthGrpcService',
      );
  }

  login(loginDto: LoginDto, metadata?: RequestMetadata) {
    return firstValueFrom(
      this.identityAuthService
        .login({ data: loginDto, metadata })
        .pipe(timeout(this.timeoutMs)),
    );
  }

  logout(logoutDto: LogoutDto, metadata?: RequestMetadata) {
    return firstValueFrom(
      this.identityAuthService
        .logout({ data: logoutDto, metadata })
        .pipe(timeout(this.timeoutMs)),
    );
  }

  refreshToken(
    refreshTokenRequestDto: RefreshTokenRequestDto,
    metadata?: RequestMetadata,
  ) {
    return firstValueFrom(
      this.identityAuthService
        .refreshToken({ data: refreshTokenRequestDto, metadata })
        .pipe(timeout(this.timeoutMs)),
    );
  }

  validateToken(
    validateTokenDto: ValidateTokenDto,
    metadata?: RequestMetadata,
  ) {
    return firstValueFrom(
      this.identityAuthService
        .validateToken({ data: validateTokenDto, metadata })
        .pipe(timeout(this.timeoutMs)),
    );
  }
}
