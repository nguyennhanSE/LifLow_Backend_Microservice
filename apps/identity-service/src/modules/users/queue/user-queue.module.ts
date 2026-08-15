import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppQueueModule } from 'libs/queue';
import { PrismaModule } from '../../../prisma/prisma.module';
import { UserRepository } from '../repositories/user.repository';
import { USER_QUEUE_NAME } from './user-queue.constant';
import { UserQueueProcessor } from './user-queue.processor';
import { UserQueueService } from './user-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    AppQueueModule.registerQueue(USER_QUEUE_NAME),
  ],
  providers: [UserQueueService, UserQueueProcessor, UserRepository],
  exports: [UserQueueService],
})
export class UserQueueModule {}
