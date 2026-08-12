import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { AppConfigModule, jwtConfig } from 'libs/config';
import { identityServiceConfig } from './config/identity-service.config';
import { IdentityServiceController } from './identity-service.controller';
import { IdentityServiceService } from './identity-service.service';

@Module({
  imports: [
    CommonModule,
    AppConfigModule.forFeature([identityServiceConfig, jwtConfig]),
  ],
  controllers: [IdentityServiceController],
  providers: [IdentityServiceService],
})
export class IdentityServiceModule {}
