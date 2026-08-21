import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { ClientProxyFactory } from '@nestjs/microservices/client/client-proxy-factory';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { AppConfigService } from 'libs/config/config.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { timeout } from 'rxjs/internal/operators/timeout';
import { ChatRequestMetadata } from '../metadata/client.metadata';

export interface ChatRequestPayload<TData> {
  data: TData;
  metadata?: ChatRequestMetadata;
}

@Injectable()
export class ChatClientService implements OnModuleDestroy {
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
          'rabbitmq.queues.chat',
          'chat_queue',
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

  async onModuleDestroy() {
    await this.client.close();
  }

  send<TData>(pattern: string, payload: ChatRequestPayload<TData>) {
    return firstValueFrom(
      this.client.send(pattern, payload).pipe(timeout(this.timeoutMs)),
    );
  }
}
