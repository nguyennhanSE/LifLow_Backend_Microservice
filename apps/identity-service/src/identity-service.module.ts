import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { AppConfigModule, jwtConfig } from 'libs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppQueueModule } from 'libs/queue';
import { identityServiceConfig } from './config/identity-service.config';
import { IdentityServiceController } from './identity-service.controller';
import { IdentityServiceService } from './identity-service.service';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { IdentityHealthGrpcController } from './grpc/health/health.grpc.controller';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityQueueModule } from './queue/identity-queue.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([identityServiceConfig, jwtConfig]),
    AppQueueModule.forRoot(),
    PrismaModule,
    IdentityQueueModule,
    AuthModule,
    RolesModule,
  ],
  controllers: [IdentityServiceController, IdentityHealthGrpcController],
  providers: [
    IdentityServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class IdentityServiceModule {}
