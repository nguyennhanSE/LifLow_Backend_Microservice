import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Module } from '@nestjs/common';
import { AppConfigModule, AppConfigService } from 'libs/config';
import { createBullRootOptions } from './queue.options';

@Module({})
export class AppQueueModule {
  static forRoot(): DynamicModule {
    return {
      module: AppQueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [AppConfigModule.forFeature([])],
          useFactory: createBullRootOptions,
          inject: [AppConfigService],
        }),
      ],
      exports: [BullModule],
    };
  }

  static registerQueue(name: string): DynamicModule {
    return {
      module: AppQueueModule,
      imports: [
        BullModule.registerQueue({
          name,
        }),
      ],
      exports: [BullModule],
    };
  }
}
