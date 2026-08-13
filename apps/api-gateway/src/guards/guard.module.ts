import { Module } from '@nestjs/common';

import { AuthGuard } from './auth.guard';
import { ClientsModule } from '../clients/clients.module';
import { RoleGuard } from './role.guard';

@Module({
  imports: [ClientsModule],
  providers: [AuthGuard, RoleGuard],
  exports: [AuthGuard, RoleGuard],
})
export class GuardModule {}
