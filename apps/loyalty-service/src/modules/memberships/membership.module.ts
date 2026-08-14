import { Module } from '@nestjs/common';
import { IdentityClientModule } from '../../clients/identity/identity-client.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { MembershipRepository } from './repositories/membership.repository';

@Module({
  imports: [PrismaModule, IdentityClientModule],
  controllers: [MembershipController],
  providers: [MembershipService, MembershipRepository],
  exports: [MembershipService],
})
export class MembershipModule {}
