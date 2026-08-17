import { Test, TestingModule } from '@nestjs/testing';
import { NutritionServiceController } from './nutrition-service.controller';
import { NutritionServiceService } from './nutrition-service.service';

describe('NutritionServiceController', () => {
  let nutritionServiceController: NutritionServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NutritionServiceController],
      providers: [NutritionServiceService],
    }).compile();

    nutritionServiceController = app.get<NutritionServiceController>(
      NutritionServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nutritionServiceController.getHello()).toBe('Hello World!');
    });
  });
});
