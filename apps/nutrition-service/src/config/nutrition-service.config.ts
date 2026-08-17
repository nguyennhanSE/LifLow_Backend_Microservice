import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const nutritionServiceConfig = registerAs('nutritionService', () => ({
  port: toNumber(process.env.NUTRITION_SERVICE_PORT, 3503),
  database: {
    url: process.env.NUTRITION_DATABASE_URL ?? '',
    host: process.env.NUTRITION_DATABASE_HOST ?? '',
    port: toNumber(process.env.NUTRITION_DATABASE_PORT ?? '', 5432),
    username: process.env.NUTRITION_DATABASE_USERNAME ?? '',
    password: process.env.NUTRITION_DATABASE_PASSWORD ?? '',
    name: process.env.NUTRITION_DATABASE_NAME ?? '',
    schema: process.env.NUTRITION_DATABASE_SCHEMA ?? '',
  },
}));
