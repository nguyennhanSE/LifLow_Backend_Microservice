import { Module } from '@nestjs/common';
import { AppConfigModule } from 'libs/config';
import { ChatMessagingClient } from './chat-messaging.client';
import { ChatClientService } from './chat.client.service';

@Module({
  imports: [AppConfigModule],
  providers: [ChatClientService, ChatMessagingClient],
  exports: [ChatClientService, ChatMessagingClient],
})
export class ChatClientModule {}
