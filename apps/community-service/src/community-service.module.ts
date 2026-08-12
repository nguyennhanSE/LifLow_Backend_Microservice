import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { CommunityServiceController } from './community-service.controller';
import { CommunityServiceService } from './community-service.service';

@Module({
  imports: [CommonModule],
  controllers: [CommunityServiceController],
  providers: [CommunityServiceService],
})
export class CommunityServiceModule {}
