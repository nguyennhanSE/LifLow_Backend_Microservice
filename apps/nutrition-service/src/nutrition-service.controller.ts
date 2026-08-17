import { Controller, Get } from '@nestjs/common';
import { NutritionServiceService } from './nutrition-service.service';

@Controller()
export class NutritionServiceController {
  constructor(private readonly nutritionServiceService: NutritionServiceService) {}

  @Get()
  getHello(): string {
    return this.nutritionServiceService.getHello();
  }
}
