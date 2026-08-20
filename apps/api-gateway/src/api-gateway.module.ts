import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { NotificationController } from './routes/notification/notification.controller';
import { NotificationGateway } from './routes/notification/gateway/notification.gateway';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { MessagingModule } from './libs/messaging/messaging.module';
import { TraceModule } from './traces/trace.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([apiGatewayConfig]),
    ClientsModule,
    GuardModule,
    TraceModule,
    MessagingModule,
  ],
  controllers: [
    AuthController,
    RoleController,
    MembershipController,
    UserController,
    NotificationController,
  ],
  providers: [
    NotificationGateway,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
