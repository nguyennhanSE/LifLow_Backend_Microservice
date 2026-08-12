import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { ChatServiceController } from './chat-service.controller';
import { ChatServiceService } from './chat-service.service';

@Module({
  imports: [CommonModule],
  controllers: [ChatServiceController],
  providers: [ChatServiceService],
})
export class ChatServiceModule {}
