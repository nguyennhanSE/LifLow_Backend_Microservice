import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { IdentityServiceModule } from './identity-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityServiceModule);
  const configService = app.get(AppConfigService);

  app.connectMicroservice<MicroserviceOptions>({
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
  });

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('identityService.port', 3501));
}
bootstrap();
