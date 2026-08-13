import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppConfigService } from 'libs/config';
import { LoyaltyServiceModule } from './loyalty-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoyaltyServiceModule);
  const configService = app.get(AppConfigService);

  app.connectMicroservice<MicroserviceOptions>({
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
  });

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('loyaltyService.port', 3502));
}
void bootstrap();
