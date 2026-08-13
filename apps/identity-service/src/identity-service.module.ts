import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { AppConfigModule, jwtConfig } from 'libs/config';
import { AuthModule } from './auth/auth.module';
import { identityServiceConfig } from './config/identity-service.config';
import { IdentityServiceController } from './identity-service.controller';
import { IdentityServiceService } from './identity-service.service';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([identityServiceConfig, jwtConfig]),
    AuthModule,
    RolesModule,
  ],
  controllers: [IdentityServiceController],
  providers: [IdentityServiceService],
})
export class IdentityServiceModule {}
