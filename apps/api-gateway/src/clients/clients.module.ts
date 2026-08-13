import { Module } from '@nestjs/common';
import { IdentityClientModule } from './identity/identity.client.module';


@Module({
  imports: [IdentityClientModule],
})
export class ClientsModule {}
