import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { AuditServiceController } from './audit-service.controller';
import { AuditServiceService } from './audit-service.service';

@Module({
  imports: [CommonModule],
  controllers: [AuditServiceController],
  providers: [AuditServiceService],
})
export class AuditServiceModule {}
