import { Module } from '@nestjs/common';
import { AppConfigModule, rabbitmqConfig } from 'libs/config';

import { LoyaltyMembershipClient } from './loyalty-membership.client';
import { LoyaltyClientService } from './loyalty.client.service';

@Module({
  imports: [AppConfigModule.forFeature([rabbitmqConfig])],
  providers: [LoyaltyClientService, LoyaltyMembershipClient],
  exports: [LoyaltyMembershipClient],
})
export class LoyaltyClientModule {}
