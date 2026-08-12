import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { PromotionServiceController } from './promotion-service.controller';
import { PromotionServiceService } from './promotion-service.service';

@Module({
  imports: [CommonModule],
  controllers: [PromotionServiceController],
  providers: [PromotionServiceService],
})
export class PromotionServiceModule {}
