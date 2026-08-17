import { Module } from '@nestjs/common';
import { AppConfigModule, rabbitmqConfig } from 'libs/config';
import { IdentityAuthClient } from './identity-auth.client';
import { IdentityClientService } from './identity.client.service';
import { IdentityRoleClient } from './identity-role.client';
import { IdentityUserClient } from './identity-user.client';

@Module({
  imports: [AppConfigModule.forFeature([rabbitmqConfig])],
  providers: [
    IdentityClientService,
    IdentityAuthClient,
    IdentityUserClient,
    IdentityRoleClient,
  ],
  exports: [IdentityAuthClient, IdentityUserClient, IdentityRoleClient],
})
export class IdentityClientModule {}
