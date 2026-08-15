import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppConfigModule, AppConfigService } from 'libs/config';
import { LokiModule } from '../loki/loki.module';
import { PrismaModule } from '../prisma/prisma.module';
import { IDENTITY_QUEUE_NAME } from './identity-queue.constant';
import { IdentityQueueProcessor } from './identity-queue.processor';
import { IdentityQueueService } from './identity-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    LokiModule,
    BullModule.registerQueueAsync({
      name: IDENTITY_QUEUE_NAME,
      imports: [AppConfigModule.forFeature([])],
      useFactory: (configService: AppConfigService) => ({
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
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [IdentityQueueService, IdentityQueueProcessor],
  exports: [IdentityQueueService],
})
export class IdentityQueueModule {}
