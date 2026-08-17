import { Injectable } from '@nestjs/common';

@Injectable()
export class NutritionServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
