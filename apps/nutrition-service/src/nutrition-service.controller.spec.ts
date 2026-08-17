import { Test, TestingModule } from '@nestjs/testing';
import { RecipeServiceController } from './nutrition-service.controller';
import { RecipeServiceService } from './nutrition-service.service';

describe('NutritionServiceController', () => {
  let nutritionServiceController: NutritionServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NutritionServiceController],
      providers: [NutritionServiceService],
    }).compile();

    nutritionServiceController = app.get<NutritionServiceController>(NutritionServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nutritionServiceController.getHello()).toBe('Hello World!');
    });
  });
});
