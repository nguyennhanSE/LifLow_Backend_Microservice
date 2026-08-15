import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'libs/prisma/generated/identity-service/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    process.env.DATABASE_URL ??= process.env.IDENTITY_SERVICE_DATABASE_URL;
    super({} as ConstructorParameters<typeof PrismaClient>[0]);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
