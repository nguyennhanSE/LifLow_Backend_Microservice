import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis.module';
import type { RedisClient } from '../redis.module';

export type RedisMessageHandler = (message: string, channel: string) => void;

@Injectable()
export class RedisMessagingService implements OnApplicationShutdown {
  private subscriberClient?: RedisClient;
  private readonly handlers = new Map<string, Set<RedisMessageHandler>>();

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async publish<TMessage>(channel: string, message: TMessage): Promise<number> {
    return this.redisClient.publish(channel, this.serialize(message));
  }

  async subscribe(
    channel: string,
    handler: RedisMessageHandler,
  ): Promise<void> {
    const channelHandlers = this.handlers.get(channel) ?? new Set();
    const shouldSubscribe = channelHandlers.size === 0;

    channelHandlers.add(handler);
    this.handlers.set(channel, channelHandlers);

    if (shouldSubscribe) {
      await this.ensureSubscriberClient().subscribe(channel);
    }
  }

  async unsubscribe(
    channel: string,
    handler?: RedisMessageHandler,
  ): Promise<void> {
    const subscriberClient = this.subscriberClient;

    if (!subscriberClient) {
      return;
    }

    if (!handler) {
      this.handlers.delete(channel);
      await subscriberClient.unsubscribe(channel);
      return;
    }

    const channelHandlers = this.handlers.get(channel);

    if (!channelHandlers) {
      return;
    }

    channelHandlers.delete(handler);

    if (channelHandlers.size === 0) {
      this.handlers.delete(channel);
      await subscriberClient.unsubscribe(channel);
    }
  }

  async onApplicationShutdown() {
    if (!this.subscriberClient || this.subscriberClient.status === 'end') {
      return;
    }

    try {
      await this.subscriberClient.quit();
    } catch {
      this.subscriberClient.disconnect();
    }
  }

  private serialize(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  private ensureSubscriberClient(): RedisClient {
    if (this.subscriberClient) {
      return this.subscriberClient;
    }

    this.subscriberClient = this.redisClient.duplicate();
    this.subscriberClient.on('message', (channel, message) => {
      const channelHandlers = this.handlers.get(channel);

      if (!channelHandlers) {
        return;
      }

      for (const handler of channelHandlers) {
        handler(message, channel);
      }
    });

    return this.subscriberClient;
  }
}
