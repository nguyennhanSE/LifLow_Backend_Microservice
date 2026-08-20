import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../redis.module';
import type { RedisClient } from '../redis.module';

export interface RedisSetOptions {
  ttlSeconds?: number;
}

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async get<TValue = string>(key: string): Promise<TValue | null> {
    const value = await this.redisClient.get(key);

    if (value === null) {
      return null;
    }

    return this.deserialize<TValue>(value);
  }

  async set<TValue>(
    key: string,
    value: TValue,
    options: RedisSetOptions = {},
  ): Promise<void> {
    const serializedValue = this.serialize(value);

    if (options.ttlSeconds && options.ttlSeconds > 0) {
      await this.redisClient.set(
        key,
        serializedValue,
        'EX',
        options.ttlSeconds,
      );
      return;
    }

    await this.redisClient.set(key, serializedValue);
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    return this.redisClient.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  private serialize(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private deserialize<TValue>(value: string): TValue {
    try {
      return JSON.parse(value) as TValue;
    } catch {
      return value as TValue;
    }
  }
}
