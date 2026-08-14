import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { PrismaModule } from '../prisma/prisma.module';
import { TraceRepository } from './repositories/trace.repository';
import { TraceService } from './trace.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [TraceService, TraceRepository],
  exports: [TraceService],
})
export class TraceModule {}
