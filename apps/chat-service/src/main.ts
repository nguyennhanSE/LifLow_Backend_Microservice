import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { ChatServiceModule } from './chat-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatServiceModule);
  const configService = app.get(AppConfigService);

  await app.listen(configService.get<number>('chatService.port', 3504));
}

void bootstrap();
