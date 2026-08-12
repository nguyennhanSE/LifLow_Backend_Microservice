import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { IdentityServiceController } from './identity-service.controller';
import { IdentityServiceService } from './identity-service.service';

@Module({
  imports: [CommonModule],
  controllers: [IdentityServiceController],
  providers: [IdentityServiceService],
})
export class IdentityServiceModule {}
