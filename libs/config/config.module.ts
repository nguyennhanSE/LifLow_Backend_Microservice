import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigFactory,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { AppConfigService } from './config.service';
import { validateEnv } from './env.validation';
import { appConfig, rabbitmqConfig } from './namespaces';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const getEnvFilePaths = (): string[] => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const envFile = NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
  
  console.log('Using env file:', envFile);
  return [envFile];
};

@Module({
  imports: [NestConfigModule],
  providers: [AppConfigService],
  exports: [NestConfigModule, AppConfigService],
})
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
          load: [appConfig, rabbitmqConfig, ...featureConfigs],
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
      imports: [
        NestConfigModule,
        ...featureConfigs.map((config) => NestConfigModule.forFeature(config)),
      ],
      providers: [AppConfigService],
      exports: [NestConfigModule, AppConfigService],
    };
  }
}
