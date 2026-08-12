import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

const toBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  urls: (process.env.RABBITMQ_URL ?? 'amqp://localhost:5672')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  timeoutMs: toNumber(process.env.RMQ_TIMEOUT_MS, 5000),
  queueOptions: {
    durable: toBoolean(process.env.RMQ_QUEUE_DURABLE, false),
  },
  queues: {
    identity: process.env.IDENTITY_QUEUE ?? 'identity_queue',
    audit: process.env.AUDIT_QUEUE ?? 'audit_queue',
    notification: process.env.NOTIFICATION_QUEUE ?? 'notification_queue',
  },
}));
