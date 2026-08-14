import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'libs/common/logger';
import { AppConfigModule, AppConfigService } from 'libs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRepository } from '../repositories/user.repository';
import { USER_QUEUE_NAME } from './user-queue.constant';
import { UserQueueProcessor } from './user-queue.processor';
import { UserQueueService } from './user-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    BullModule.registerQueueAsync({
      name: USER_QUEUE_NAME,
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
  providers: [UserQueueService, UserQueueProcessor, UserRepository],
  exports: [UserQueueService],
})
export class UserQueueModule {}
