import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import {AppConfigService} from '../../../../libs/config';
import { firstValueFrom, timeout } from 'rxjs';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
} from '../routes/auth/dtos/auth.dto';
import { IDENTITY_AUTH_PATTERNS } from './patterns/identity-client.pattern';
import { IdentityRequestMetadata } from './metadata/client.metadata';

export interface IdentityRequestPayload<TData> {
  data: TData;
  metadata?: IdentityRequestMetadata;
}

export interface TokenPayload {
  sub: string;
  email?: string;
  username?: string;
  tokenType: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class IdentityClient implements OnModuleDestroy {
  private readonly client: ClientProxy;
  private readonly timeoutMs: number;

  constructor(private readonly configService: AppConfigService) {
    this.timeoutMs = this.configService.get<number>('rabbitmq.timeoutMs', 5000);
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: this.configService.get<string[]>('rabbitmq.urls', [
          'amqp://localhost:5672',
        ]),
        queue: this.configService.get<string>(
          'rabbitmq.queues.identity',
          'identity_queue',
        ),
        queueOptions: {
          durable: this.configService.get<boolean>(
            'rabbitmq.queueOptions.durable',
            false,
          ),
        },
      },
    });
  }

  login(loginDto: LoginDto, metadata: IdentityRequestMetadata) {
    return this.send(IDENTITY_AUTH_PATTERNS.login, {
      data: loginDto,
      metadata,
    });
  }

  logout(logoutDto: LogoutDto) {
    return this.send(IDENTITY_AUTH_PATTERNS.logout, {
      data: logoutDto,
    });
  }

  refreshToken(
    refreshTokenDto: RefreshTokenRequestDto,
    metadata: IdentityRequestMetadata,
  ) {
    return this.send(IDENTITY_AUTH_PATTERNS.refreshToken, {
      data: refreshTokenDto,
      metadata,
    });
  }

  validateToken(accessToken: string) {
    return this.send<{ accessToken: string }>(
      IDENTITY_AUTH_PATTERNS.validateToken,
      {
        data: { accessToken },
      },
    );
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  private send<TData>(pattern: string, payload: IdentityRequestPayload<TData>) {
    return firstValueFrom(
      this.client.send(pattern, payload).pipe(timeout(this.timeoutMs)),
    );
  }
}
