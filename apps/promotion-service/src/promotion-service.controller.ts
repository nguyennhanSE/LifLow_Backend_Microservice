import { Controller, Get } from '@nestjs/common';
import { PromotionServiceService } from './promotion-service.service';

@Controller()
export class PromotionServiceController {
  constructor(private readonly promotionServiceService: PromotionServiceService) {}

  @Get()
  getHello(): string {
    return this.promotionServiceService.getHello();
  }
}
