import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppConfigService } from 'libs/config';
import { firstValueFrom, timeout } from 'rxjs';
import type { NutritionRequestPayload } from '../../common';
import { IDENTITY_CLIENT } from './identity-client.constants';

@Injectable()
export class IdentityClientService {
  private readonly timeoutMs: number;

  constructor(
    @Inject(IDENTITY_CLIENT)
    private readonly client: ClientProxy,
    private readonly configService: AppConfigService,
  ) {
    this.timeoutMs = this.configService.get<number>('rabbitmq.timeoutMs', 5000);
  }

  send<TResponse = unknown, TData = unknown>(
    pattern: string,
    payload: NutritionRequestPayload<TData>,
  ): Promise<TResponse> {
    return firstValueFrom(
      this.client
        .send<TResponse, NutritionRequestPayload<TData>>(pattern, payload)
        .pipe(timeout(this.timeoutMs)),
    );
  }

  async emit<TData = unknown>(
    pattern: string,
    payload: NutritionRequestPayload<TData>,
  ): Promise<void> {
    await firstValueFrom(
      this.client
        .emit<unknown, NutritionRequestPayload<TData>>(pattern, payload)
        .pipe(timeout(this.timeoutMs)),
    );
  }
}
