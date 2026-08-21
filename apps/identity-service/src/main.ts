import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from 'libs/config';
import { createGrpcMicroserviceOptions } from 'libs/grpc';
import { IdentityServiceModule } from './identity-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityServiceModule);
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
          'rabbitmq.queues.identity',
          'identity_queue',
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
      'identity',
      'identity.proto',
      configService.get<number>('identityService.grpc.port', 50052),
    ),
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('identityService.port', 3501));
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Liflow Identity Service')
    .setDescription('HTTP API documentation for Liflow Identity Service')
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
bootstrap();
