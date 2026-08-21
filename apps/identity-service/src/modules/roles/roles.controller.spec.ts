import { Test, TestingModule } from '@nestjs/testing';
import { RolesMessagingController } from '../../messaging/roles/roles.messaging.controller';

describe('RolesController', () => {
  let controller: RolesMessagingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesMessagingController],
    }).compile();

    controller = module.get<RolesMessagingController>(RolesMessagingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
