import { Module } from '@nestjs/common';
import { ChatClientModule } from './chat/chat.client.module';
import { IdentityClientModule } from './identity/identity.client.module';
import { LoyaltyClientModule } from './loyalty/loyalty.client.module';
import { NotificationClientModule } from './notification/notification.client.module';

@Module({
  imports: [
    ChatClientModule,
    IdentityClientModule,
    LoyaltyClientModule,
    NotificationClientModule,
  ],
  exports: [
    ChatClientModule,
    IdentityClientModule,
    LoyaltyClientModule,
    NotificationClientModule,
  ],
})
export class ClientsModule {}
