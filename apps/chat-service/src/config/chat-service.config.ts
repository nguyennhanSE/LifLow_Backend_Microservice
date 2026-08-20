import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const chatServiceConfig = registerAs('chatService', () => ({
  port: toNumber(process.env.CHAT_SERVICE_PORT, 3504),
  database: {
    url: process.env.CHAT_SERVICE_DATABASE_URL ?? '',
    host: process.env.CHAT_SERVICE_DATABASE_HOST ?? '',
    port: toNumber(process.env.CHAT_SERVICE_DATABASE_PORT ?? '', 5432),
    username: process.env.CHAT_SERVICE_DATABASE_USERNAME ?? '',
    password: process.env.CHAT_SERVICE_DATABASE_PASSWORD ?? '',
    name: process.env.CHAT_SERVICE_DATABASE_NAME ?? '',
    schema: process.env.CHAT_SERVICE_DATABASE_SCHEMA ?? '',
  },
}));
