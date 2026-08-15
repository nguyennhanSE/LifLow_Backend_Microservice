import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppQueueModule } from 'libs/queue';
import { LokiModule } from '../../../../libs/observability/loki/loki.module';
import { PrismaModule } from '../prisma/prisma.module';
import { IDENTITY_QUEUE_NAME } from './identity-queue.constant';
import { IdentityQueueProcessor } from './identity-queue.processor';
import { IdentityQueueService } from './identity-queue.service';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    LokiModule,
    AppQueueModule.registerQueue(IDENTITY_QUEUE_NAME),
  ],
  providers: [IdentityQueueService, IdentityQueueProcessor],
  exports: [IdentityQueueService],
})
export class IdentityQueueModule {}
