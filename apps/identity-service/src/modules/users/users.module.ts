import { Module } from '@nestjs/common';
import { IdentityClientModule } from '../../clients/identity/identity-client.module';
import { UsersGrpcController } from '../../grpc/users/users.grpc.controller';
import { UsersMessagingController } from '../../messaging/users/users.messaging.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserQueueModule } from './queue/user-queue.module';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, UserQueueModule, IdentityClientModule],
  providers: [UsersService, UserRepository],
  controllers: [UsersMessagingController, UsersGrpcController],
  exports: [UsersService],
})
export class UsersModule {}
