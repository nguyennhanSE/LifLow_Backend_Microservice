import { Module } from '@nestjs/common';
import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { AwsService } from './aws.service';
import {
  AppConfigModule,
  AppConfigService,
  objectStorageConfig,
} from 'libs/config';
import { LoggerModule } from 'libs/common/logger';

import { AwsController } from './aws.controller';
import { S3_CLIENT } from './aws.constants';

const s3ClientProvider = {
  provide: S3_CLIENT,
  useFactory: (configService: AppConfigService): S3Client => {
    const accessKeyId = configService.get<string>('objectStorage.accessKeyId');
    const secretAccessKey = configService.get<string>(
      'objectStorage.secretAccessKey',
    );
    const endpoint = configService.get<string>('objectStorage.endpoint');
    const useSsl = configService.get<boolean>('objectStorage.useSsl', true);

      console.log('objectStorage.accessKeyId', accessKeyId);
      console.log('objectStorage.secretAccessKey', secretAccessKey);
      console.log('objectStorage.region', configService.get<string>('objectStorage.region', 'ap-northeast-2'));
      console.log('objectStorage.useSsl', useSsl);
    const s3Config: S3ClientConfig = {
      region: configService.get<string>(
        'objectStorage.region',
        'ap-northeast-2',
      ),
      forcePathStyle: configService.get<boolean>(
        'objectStorage.forcePathStyle',
        false,
      ),
    };

    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    if (endpoint) {
      s3Config.endpoint = endpoint.includes('://')
        ? endpoint
        : `${useSsl ? 'https' : 'http'}://${endpoint}`;
    }

    return new S3Client(s3Config);
  },
  inject: [AppConfigService],
};

@Module({
  imports: [AppConfigModule.forFeature([objectStorageConfig]), LoggerModule],
  controllers: [AwsController],
  providers: [s3ClientProvider, AwsService],
  exports: [AwsService, S3_CLIENT],
})
export class AwsModule {}
