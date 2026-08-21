import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { createGrpcMicroserviceOptions } from 'libs/grpc';
import { ChatServiceModule } from './chat-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatServiceModule);
  const configService = app.get(AppConfigService);

  app.connectMicroservice(
    createGrpcMicroserviceOptions(
      'chat',
      'chat.proto',
      configService.get<number>('chatService.grpc.port', 50055),
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('chatService.port', 3504));
}

void bootstrap();
