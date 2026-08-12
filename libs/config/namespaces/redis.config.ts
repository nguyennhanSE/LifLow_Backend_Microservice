import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: toNumber(process.env.REDIS_PORT, 6379),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  db: toNumber(process.env.REDIS_DB, 0),
}));
