import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  const configService = app.get(AppConfigService);

  await app.listen(configService.get<number>('notificationService.port', 3505));
}

void bootstrap();
