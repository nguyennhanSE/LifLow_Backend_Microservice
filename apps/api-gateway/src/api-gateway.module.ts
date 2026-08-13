import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { ClientsModule } from './clients/clients.module';
import { apiGatewayConfig } from './config/api-gateway.config';
import { AuthGuard } from './guards/auth.guard';
import { GuardModule } from './guards/guard.module';
import { AuthController } from './routes/auth/auth.controller';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([apiGatewayConfig]),
    ClientsModule,
    GuardModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ApiGatewayModule {}
