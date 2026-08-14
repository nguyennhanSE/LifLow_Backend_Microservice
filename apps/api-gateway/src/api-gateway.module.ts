import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';

import { apiGatewayConfig } from './config/api-gateway.config';
import { ClientsModule } from './clients/clients.module';
import { AuthGuard } from './guards/auth.guard';
import { GuardModule } from './guards/guard.module';
import { AuthController } from './routes/auth/auth.controller';
import { RoleController } from './routes/roles/role.controller';
import { RoleGuard } from './guards/role.guard';
import { MembershipController } from './routes/memberships/membership.controller';
import { UserController } from './routes/users/user.controller';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([apiGatewayConfig]),
    ClientsModule,
    GuardModule,
  ],
  controllers: [
    AuthController,
    RoleController,
    MembershipController,
    UserController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    }
  ],
})
export class ApiGatewayModule {}
