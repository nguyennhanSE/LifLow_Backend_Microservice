import { Module } from '@nestjs/common';
import { PromotionServiceController } from './promotion-service.controller';
import { PromotionServiceService } from './promotion-service.service';

@Module({
  imports: [],
  controllers: [PromotionServiceController],
  providers: [PromotionServiceService],
})
export class PromotionServiceModule {}
