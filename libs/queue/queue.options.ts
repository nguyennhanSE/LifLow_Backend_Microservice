import type { BullRootModuleOptions } from '@nestjs/bullmq';
import type { AppConfigService } from 'libs/config';

export const createBullRootOptions = (
  configService: AppConfigService,
): BullRootModuleOptions => ({
  connection: {
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
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 20,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});
