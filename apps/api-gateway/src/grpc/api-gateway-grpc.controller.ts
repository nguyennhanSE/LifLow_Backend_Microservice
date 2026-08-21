import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class ApiGatewayGrpcController {
  @GrpcMethod('ApiGatewayGrpcService', 'Health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
