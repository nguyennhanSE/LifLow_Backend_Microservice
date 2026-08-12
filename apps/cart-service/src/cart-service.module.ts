import { Module } from '@nestjs/common';
import { CommonModule } from 'libs/common';
import { CartServiceController } from './cart-service.controller';
import { CartServiceService } from './cart-service.service';

@Module({
  imports: [CommonModule],
  controllers: [CartServiceController],
  providers: [CartServiceService],
})
export class CartServiceModule {}
