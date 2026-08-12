import { NestFactory } from '@nestjs/core';
import { PromotionServiceModule } from './promotion-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PromotionServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
