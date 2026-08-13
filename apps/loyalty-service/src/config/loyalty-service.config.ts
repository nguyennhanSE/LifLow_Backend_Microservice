import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const loyaltyServiceConfig = registerAs('loyaltyService', () => ({
  port: toNumber(process.env.LOYALTY_SERVICE_PORT, 3502),
  database: {
    url: process.env.LOYALTY_SERVICE_DATABASE_URL ?? '',
    host: process.env.LOYALTY_SERVICE_DATABASE_HOST ?? '',
    port: toNumber(process.env.LOYALTY_SERVICE_DATABASE_PORT ?? '', 5432),
    username: process.env.LOYALTY_SERVICE_DATABASE_USERNAME ?? '',
    password: process.env.LOYALTY_SERVICE_DATABASE_PASSWORD ?? '',
    name: process.env.LOYALTY_SERVICE_DATABASE_NAME ?? '',
    schema: process.env.LOYALTY_SERVICE_DATABASE_SCHEMA ?? '',
  },
}));
