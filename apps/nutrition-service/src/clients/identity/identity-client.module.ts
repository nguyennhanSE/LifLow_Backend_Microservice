import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigModule, AppConfigService, rabbitmqConfig } from 'libs/config';
import { IDENTITY_CLIENT } from './identity-client.constants';
import { IdentityClientService } from './identity-client.service';

@Module({
  imports: [
    AppConfigModule,
    ClientsModule.registerAsync([
      {
        name: IDENTITY_CLIENT,
        imports: [AppConfigModule.forFeature([rabbitmqConfig])],
        useFactory: (configService: AppConfigService) => ({
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
        }),
        inject: [AppConfigService],
      },
    ]),
  ],
  providers: [IdentityClientService],
  exports: [IdentityClientService],
})
export class IdentityClientModule {}
