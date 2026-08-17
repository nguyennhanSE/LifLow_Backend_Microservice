import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'libs/prisma/generated/api-gateway/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    process.env.DATABASE_URL ??= process.env.API_GATEWAY_DATABASE_URL;
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
