import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class NutritionHealthGrpcController {
  @GrpcMethod('NutritionGrpcService', 'Health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
