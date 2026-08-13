import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { loyaltyServiceConfig } from './config/loyalty-service.config';
import { LoyaltyServiceController } from './loyalty-service.controller';
import { LoyaltyServiceService } from './loyalty-service.service';
import { MembershipModule } from './modules/memberships/membership.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([loyaltyServiceConfig]),
    MembershipModule,
  ],
  controllers: [LoyaltyServiceController],
  providers: [LoyaltyServiceService],
})
export class LoyaltyServiceModule {}
