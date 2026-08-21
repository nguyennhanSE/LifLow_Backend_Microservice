import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class NotificationHealthGrpcController {
  @GrpcMethod('NotificationGrpcService', 'Health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
