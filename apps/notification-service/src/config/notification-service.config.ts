import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const notificationServiceConfig = registerAs(
  'notificationService',
  () => ({
    port: toNumber(process.env.NOTIFICATION_SERVICE_PORT, 3505),
    grpc: {
      port: toNumber(process.env.NOTIFICATION_SERVICE_GRPC_PORT, 50056),
    },
    database: {
      url: process.env.NOTIFICATION_SERVICE_DATABASE_URL ?? '',
      host: process.env.NOTIFICATION_SERVICE_DATABASE_HOST ?? '',
      port: toNumber(
        process.env.NOTIFICATION_SERVICE_DATABASE_PORT ?? '',
        5432,
      ),
      username: process.env.NOTIFICATION_SERVICE_DATABASE_USERNAME ?? '',
      password: process.env.NOTIFICATION_SERVICE_DATABASE_PASSWORD ?? '',
      name: process.env.NOTIFICATION_SERVICE_DATABASE_NAME ?? '',
      schema: process.env.NOTIFICATION_SERVICE_DATABASE_SCHEMA ?? '',
    },
  }),
);
