import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class LoyaltyHealthGrpcController {
  @GrpcMethod('LoyaltyGrpcService', 'Health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
