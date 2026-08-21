import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { createGrpcMicroserviceOptions } from 'libs/grpc';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  const configService = app.get(AppConfigService);

  app.connectMicroservice(
    createGrpcMicroserviceOptions(
      'notification',
      'notification.proto',
      configService.get<number>('notificationService.grpc.port', 50056),
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('notificationService.port', 3505));
}

void bootstrap();
