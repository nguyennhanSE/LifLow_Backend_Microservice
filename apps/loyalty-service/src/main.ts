import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { LoyaltyServiceModule } from './loyalty-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoyaltyServiceModule);
  const configService = app.get(AppConfigService);
  await app.listen(configService.get<number>('loyaltyService.port', 3502));
}
void bootstrap();
