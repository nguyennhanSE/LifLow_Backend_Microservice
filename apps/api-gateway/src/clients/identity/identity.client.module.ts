import { Module } from '@nestjs/common';
import { IdentityAuthClient } from './identity-auth.client';
import { IdentityClientService } from './identity.client.service';
import { IdentityRoleClient } from './identity-role.client';
import { IdentityUserClient } from './identity-user.client';

@Module({
  providers: [
    IdentityClientService,
    IdentityAuthClient,
    IdentityUserClient,
    IdentityRoleClient,
  ],
  exports: [IdentityAuthClient, IdentityUserClient, IdentityRoleClient],
})
export class IdentityClientModule {}
