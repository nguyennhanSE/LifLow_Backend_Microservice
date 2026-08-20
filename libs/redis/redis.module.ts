import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigModule, AppConfigService, redisConfig } from 'libs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export type RedisClient = Redis;

export const createRedisClient = (
  configService: AppConfigService,
): RedisClient =>
  new Redis({
    host: configService.get<string>('redis.host', 'localhost'),
    port: configService.get<number>('redis.port', 6379),
    username: configService.get<string | undefined>(
      'redis.username',
      undefined,
    ),
    password: configService.get<string | undefined>(
      'redis.password',
      undefined,
    ),
    db: configService.get<number>('redis.db', 0),
  });

@Global()
@Module({
  imports: [AppConfigModule.forFeature([redisConfig])],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: createRedisClient,
      inject: [AppConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async onApplicationShutdown() {
    if (this.redisClient.status === 'end') {
      return;
    }

    try {
      await this.redisClient.quit();
    } catch {
      this.redisClient.disconnect();
    }
  }
}
