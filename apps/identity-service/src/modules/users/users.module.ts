import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { UserQueueModule } from './queue/user-queue.module';
import { IdentityClientModule } from '../../clients/identity/identity-client.module';

@Module({
  imports: [PrismaModule, UserQueueModule, IdentityClientModule],
  providers: [UsersService, UserRepository],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
