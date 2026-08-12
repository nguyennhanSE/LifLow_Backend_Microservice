import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppConfigModule } from 'libs/config';
import { AllExceptionsFilter } from './filters/exception.filter';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [AppConfigModule.forRoot(), LoggerModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [AppConfigModule, LoggerModule],
})
export class CommonModule {}
