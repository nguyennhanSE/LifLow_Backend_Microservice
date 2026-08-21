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
import { MessagingController } from './routes/messaging/messaging.controller';
import { MessagingWebSocketGateway } from './routes/messaging/websocket-gateway/messaging.websocket-gateway';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { MessagingModule } from './libs/messaging/messaging.module';
import { TraceModule } from './traces/trace.module';
import { ApiGatewayGrpcController } from './grpc/api-gateway-grpc.controller';
import { AuthGrpcModule } from './grpc/auth/auth.grpc.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([apiGatewayConfig]),
    ClientsModule,
    GuardModule,
    TraceModule,
    MessagingModule,
    AuthGrpcModule,
  ],
  controllers: [
    AuthController,
    RoleController,
    MembershipController,
    UserController,
    NotificationController,
    MessagingController,
    ApiGatewayGrpcController,
  ],
  providers: [
    NotificationGateway,
    MessagingWebSocketGateway,
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
