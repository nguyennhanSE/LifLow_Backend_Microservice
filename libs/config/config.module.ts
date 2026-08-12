import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigFactory,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { AppConfigService } from './config.service';
import { validateEnv } from './env.validation';
import {
  appConfig,
  observabilityConfig,
  rabbitmqConfig,
  redisConfig,
} from './namespaces';

const getEnvFilePaths = (): string[] => {
  const nodeEnv = process.env.NODE_ENV;

  return [
    nodeEnv ? `.env.${nodeEnv}` : '.env.dev',
  ];
};

@Module({})
export class AppConfigModule {
  static forRoot(featureConfigs: ConfigFactory[] = []): DynamicModule {
    return {
      module: AppConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          expandVariables: true,
          envFilePath: getEnvFilePaths(),
          load: [
            appConfig,
            observabilityConfig,
            rabbitmqConfig,
            redisConfig,
            ...featureConfigs,
          ],
          validate: validateEnv,
        }),
      ],
      providers: [AppConfigService],
      exports: [NestConfigModule, AppConfigService],
    };
  }

  static forFeature(featureConfigs: ConfigFactory[]): DynamicModule {
    return {
      module: AppConfigModule,
      imports: featureConfigs.map((config) =>
        NestConfigModule.forFeature(config),
      ),
      providers: [AppConfigService],
      exports: [NestConfigModule, AppConfigService],
    };
  }
}
