import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppConfigService } from 'libs/config';
import { firstValueFrom, timeout } from 'rxjs';
import type { IdentityRequestPayload } from '../../common';
import {
  IDENTITY_CLIENT,
  USER_EVENTS_CLIENT,
} from './identity-client.constants';

@Injectable()
export class IdentityClientService {
  private readonly timeoutMs: number;

  constructor(
    @Inject(IDENTITY_CLIENT)
    private readonly identityClient: ClientProxy,
    @Inject(USER_EVENTS_CLIENT)
    private readonly userEventsClient: ClientProxy,
    private readonly configService: AppConfigService,
  ) {
    this.timeoutMs = this.configService.get<number>('rabbitmq.timeoutMs', 5000);
  }

  send<TResponse = unknown, TData = unknown>(
    pattern: string,
    payload: IdentityRequestPayload<TData>,
  ): Promise<TResponse> {
    return firstValueFrom(
      this.identityClient
        .send<TResponse, IdentityRequestPayload<TData>>(pattern, payload)
        .pipe(timeout(this.timeoutMs)),
    );
  }

  async emit<TData = unknown>(
    pattern: string,
    payload: IdentityRequestPayload<TData>,
  ): Promise<void> {
    await firstValueFrom(
      this.userEventsClient
        .emit<unknown, IdentityRequestPayload<TData>>(pattern, payload)
        .pipe(timeout(this.timeoutMs)),
    );
  }
}
