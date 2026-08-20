import { Module } from '@nestjs/common';
import { RedisModule } from '../redis.module';
import { RedisMessagingService } from './messaging.service';

@Module({
  imports: [RedisModule],
  providers: [RedisMessagingService],
  exports: [RedisMessagingService],
})
export class RedisMessagingModule {}
