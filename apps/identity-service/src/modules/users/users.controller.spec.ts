import { Test, TestingModule } from '@nestjs/testing';
import { UsersMessagingController } from '../../messaging/users/users.messaging.controller';

describe('UsersController', () => {
  let controller: UsersMessagingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersMessagingController],
    }).compile();

    controller = module.get<UsersMessagingController>(UsersMessagingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
