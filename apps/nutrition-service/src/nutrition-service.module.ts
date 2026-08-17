import { Module } from '@nestjs/common';
import { NutritionServiceController } from './nutrition-service.controller';
import { NutritionServiceService } from './nutrition-service.service';

@Module({
  imports: [],
  controllers: [NutritionServiceController],
  providers: [NutritionServiceService],
})
export class NutritionServiceModule {}
