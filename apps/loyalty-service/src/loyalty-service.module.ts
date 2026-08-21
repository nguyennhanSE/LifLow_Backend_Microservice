import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AppQueueModule } from 'libs/queue';
import { loyaltyServiceConfig } from './config/loyalty-service.config';
import { IdentityClientModule } from './clients/identity/identity-client.module';
import { LoyaltyHealthGrpcController } from './grpc/health/health.grpc.controller';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { LoyaltyServiceController } from './loyalty-service.controller';
import { LoyaltyServiceService } from './loyalty-service.service';
import { MembershipModule } from './modules/memberships/membership.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoyaltyQueueModule } from './queue/loyalty-queue.module';

@Module({
  imports: [
    AppConfigModule.forFeature([loyaltyServiceConfig]),
    IdentityClientModule,
    CommonModule,
    AppQueueModule.forRoot(),
    PrismaModule,
    LoyaltyQueueModule,
    MembershipModule,
  ],
  controllers: [LoyaltyServiceController, LoyaltyHealthGrpcController],
  providers: [
    LoyaltyServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class LoyaltyServiceModule {}
