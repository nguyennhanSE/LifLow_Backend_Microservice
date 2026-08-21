import { Module } from '@nestjs/common';
import { RolesGrpcController } from '../../grpc/roles/roles.grpc.controller';
import { RolesMessagingController } from '../../messaging/roles/roles.messaging.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RoleRepository } from './repositories/role.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [PrismaModule],
  providers: [RolesService, RoleRepository],
  controllers: [RolesMessagingController, RolesGrpcController],
  exports: [RolesService],
})
export class RolesModule {}
