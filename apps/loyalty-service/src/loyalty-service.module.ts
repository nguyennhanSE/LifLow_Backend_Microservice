import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { LoyaltyServiceController } from './loyalty-service.controller';
import { LoyaltyServiceService } from './loyalty-service.service';

@Module({
  imports: [CommonModule],
  controllers: [LoyaltyServiceController],
  providers: [LoyaltyServiceService],
})
export class LoyaltyServiceModule {}
