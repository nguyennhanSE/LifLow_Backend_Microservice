import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from 'libs/config';
import { NutritionServiceModule } from './nutrition-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NutritionServiceModule);
  const configService = app.get(AppConfigService);

  configureSwagger(app);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: configService.get<string[]>('rabbitmq.urls', [
        'amqp://localhost:5672',
      ]),
      queue: configService.get<string>(
        'rabbitmq.queues.nutrition',
        'nutrition_queue',
      ),
      exchange: configService.get<string>(
        'rabbitmq.exchanges.userEvents',
        'user.events',
      ),
      exchangeType: 'fanout',
      queueOptions: {
        durable: configService.get<boolean>(
          'rabbitmq.queueOptions.durable',
          false,
        ),
      },
    },
  },
  {inheritAppConfig: true}
);

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('nutritionService.port', 3503));
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Liflow Nutrition Service')
    .setDescription('HTTP API documentation for Liflow Nutrition Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

void bootstrap();
