import { Module } from '@nestjs/common';
import { join } from 'node:path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigModule, AppConfigService } from 'libs/config';
import { apiGatewayConfig } from '../../config/api-gateway.config';
import { AuthGrpcController } from './auth.grpc.controller';
import {
  AuthGrpcService,
  IDENTITY_AUTH_GRPC_CLIENT,
} from './auth.grpc.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: IDENTITY_AUTH_GRPC_CLIENT,
        imports: [AppConfigModule.forFeature([apiGatewayConfig])],
        useFactory: (configService: AppConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'identity',
            protoPath: join(process.cwd(), 'proto', 'identity.proto'),
            url: configService.get<string>(
              'apiGateway.downstreams.identity.grpcUrl',
              'localhost:50052',
            ),
          },
        }),
        inject: [AppConfigService],
      },
    ]),
  ],
  controllers: [AuthGrpcController],
  providers: [AuthGrpcService],
  exports: [AuthGrpcService],
})
export class AuthGrpcModule {}
