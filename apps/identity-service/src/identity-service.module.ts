import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { AppConfigModule, jwtConfig } from 'libs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { identityServiceConfig } from './config/identity-service.config';
import { IdentityServiceController } from './identity-service.controller';
import { IdentityServiceService } from './identity-service.service';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityQueueModule } from './queue/identity-queue.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([identityServiceConfig, jwtConfig]),
    PrismaModule,
    IdentityQueueModule,
    AuthModule,
    RolesModule,
  ],
  controllers: [IdentityServiceController],
  providers: [
    IdentityServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class IdentityServiceModule {}
