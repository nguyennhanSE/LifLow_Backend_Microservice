import { NestFactory } from '@nestjs/core';
import { RecipeServiceModule } from './nutrition-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RecipeServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
