import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';

@Module({
  imports: [CommonModule],
  controllers: [CatalogServiceController],
  providers: [CatalogServiceService],
})
export class CatalogServiceModule {}
