import { Test, TestingModule } from '@nestjs/testing';
import { PromotionServiceController } from './promotion-service.controller';
import { PromotionServiceService } from './promotion-service.service';

describe('PromotionServiceController', () => {
  let promotionServiceController: PromotionServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PromotionServiceController],
      providers: [PromotionServiceService],
    }).compile();

    promotionServiceController = app.get<PromotionServiceController>(PromotionServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(promotionServiceController.getHello()).toBe('Hello World!');
    });
  });
});
