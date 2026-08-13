import { Module } from '@nestjs/common';
import { IdentityClientModule } from './identity/identity.client.module';
import { LoyaltyClientModule } from './loyalty/loyalty.client.module';


@Module({
  imports: [IdentityClientModule, LoyaltyClientModule],
  exports: [IdentityClientModule, LoyaltyClientModule],
})
export class ClientsModule {}
