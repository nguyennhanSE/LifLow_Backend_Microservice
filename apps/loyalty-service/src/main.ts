import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from 'libs/config';
import { createGrpcMicroserviceOptions } from 'libs/grpc';
import { LoyaltyServiceModule } from './loyalty-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoyaltyServiceModule);
  const configService = app.get(AppConfigService);

  configureSwagger(app);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: configService.get<string[]>('rabbitmq.urls', [
          'amqp://localhost:5672',
        ]),
        queue: configService.get<string>(
          'rabbitmq.queues.loyalty',
          'loyalty_queue',
        ),
        queueOptions: {
          durable: configService.get<boolean>(
            'rabbitmq.queueOptions.durable',
            false,
          ),
        },
      },
    },
    { inheritAppConfig: true },
  );

  app.connectMicroservice(
    createGrpcMicroserviceOptions(
      'loyalty',
      'loyalty.proto',
      configService.get<number>('loyaltyService.grpc.port', 50053),
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('loyaltyService.port', 3502));
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Liflow Loyalty Service')
    .setDescription('HTTP API documentation for Liflow Loyalty Service')
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
