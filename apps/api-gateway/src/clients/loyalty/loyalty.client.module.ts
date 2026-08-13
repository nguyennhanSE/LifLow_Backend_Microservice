import { Module } from '@nestjs/common';

import { LoyaltyMembershipClient } from './loyalty-membership.client';
import { LoyaltyClientService } from './loyalty.client.service';

@Module({
  providers: [LoyaltyClientService, LoyaltyMembershipClient],
  exports: [LoyaltyMembershipClient],
})
export class LoyaltyClientModule {}
