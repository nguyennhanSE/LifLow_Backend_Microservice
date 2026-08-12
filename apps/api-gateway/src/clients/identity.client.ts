import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
} from '../routes/auth/dtos/auth.dto';
import { IDENTITY_AUTH_PATTERNS } from './patterns/identity-client.pattern';

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
  private readonly timeoutMs = Number(process.env.RMQ_TIMEOUT_MS ?? 5000);

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: process.env.IDENTITY_QUEUE ?? 'identity_queue',
        queueOptions: {
          durable: false,
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
    return this.send<{ accessToken: string }>(IDENTITY_AUTH_PATTERNS.validateToken, {
      data: { accessToken },
    });
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
