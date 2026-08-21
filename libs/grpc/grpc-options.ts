import { join } from 'node:path';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';

export function createGrpcMicroserviceOptions(
  packageName: string,
  protoFileName: string,
  port: number,
): MicroserviceOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: packageName,
      protoPath: join(process.cwd(), 'proto', protoFileName),
      url: `0.0.0.0:${port}`,
    },
  };
}
