import { Module } from '@nestjs/common';
import { RedisMessagingModule } from 'libs/redis';
import { MessagingService } from './messaging.service';

@Module({
  imports: [RedisMessagingModule],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
