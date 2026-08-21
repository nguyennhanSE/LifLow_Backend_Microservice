import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { IdentityClientModule } from '../../clients/identity/identity-client.module';
import { MembershipsGrpcController } from '../../grpc/memberships/memberships.grpc.controller';
import { MembershipsMessagingController } from '../../messaging/memberships/memberships.messaging.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MembershipService } from './membership.service';
import { MembershipRepository } from './repositories/membership.repository';

@Module({
  imports: [PrismaModule, IdentityClientModule, LoggerModule],
  controllers: [MembershipsMessagingController, MembershipsGrpcController],
  providers: [MembershipService, MembershipRepository],
  exports: [MembershipService],
})
export class MembershipModule {}
