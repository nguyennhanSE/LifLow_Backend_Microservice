import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'liflow-backend',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.APP_PORT ?? process.env.PORT, 3000),
  host: process.env.APP_HOST ?? 'http://localhost:3000',
  frontend: {
    port: toNumber(process.env.FRONTEND_PORT, 3001),
    url: process.env.FRONTEND_URL ?? 'http://localhost:3001',
  },
}));
