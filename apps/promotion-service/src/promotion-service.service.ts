import { Injectable } from '@nestjs/common';

@Injectable()
export class PromotionServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
