import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [ClientsModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class GuardModule {}
