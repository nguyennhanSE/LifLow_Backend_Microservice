import { Module } from '@nestjs/common';
import { IdentityClientModule } from './identity/identity.client.module';
import { LoyaltyClientModule } from './loyalty/loyalty.client.module';
import { NotificationClientModule } from './notification/notification.client.module';

@Module({
  imports: [
    IdentityClientModule,
    LoyaltyClientModule,
    NotificationClientModule,
  ],
  exports: [
    IdentityClientModule,
    LoyaltyClientModule,
    NotificationClientModule,
  ],
})
export class ClientsModule {}
