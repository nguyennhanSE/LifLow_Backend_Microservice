import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AppConfigModule, observabilityConfig } from 'libs/config';
import { LokiService } from './loki.service';

@Module({
  imports: [AppConfigModule.forFeature([observabilityConfig]), LoggerModule],
  providers: [LokiService],
  exports: [LokiService],
})
export class LokiModule {}
