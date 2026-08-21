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

const toStringList = (
  value: string | undefined,
  defaultValue: string[],
): string[] => {
  if (!value) {
    return defaultValue;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const apiGatewayConfig = registerAs('apiGateway', () => ({
  port: toNumber(process.env.API_GATEWAY_PORT ?? process.env.APP_PORT, 3500),
  grpc: {
    port: toNumber(process.env.API_GATEWAY_GRPC_PORT, 50051),
  },
  downstreams: {
    identity: {
      grpcUrl:
        process.env.IDENTITY_SERVICE_GRPC_URL ??
        `localhost:${process.env.IDENTITY_SERVICE_GRPC_PORT ?? '50052'}`,
      timeoutMs: toNumber(
        process.env.IDENTITY_SERVICE_GRPC_TIMEOUT_MS ??
          process.env.RMQ_TIMEOUT_MS,
        5000,
      ),
    },
    chat: {
      grpcUrl:
        process.env.CHAT_SERVICE_GRPC_URL ??
        `localhost:${process.env.CHAT_SERVICE_GRPC_PORT ?? '50055'}`,
      timeoutMs: toNumber(
        process.env.CHAT_SERVICE_GRPC_TIMEOUT_MS ?? process.env.RMQ_TIMEOUT_MS,
        5000,
      ),
    },
  },
  database: {
    url: process.env.API_GATEWAY_DATABASE_URL ?? '',
    host: process.env.API_GATEWAY_DATABASE_HOST ?? '',
    port: toNumber(process.env.API_GATEWAY_DATABASE_PORT ?? '', 5432),
    username: process.env.API_GATEWAY_DATABASE_USERNAME ?? '',
    password: process.env.API_GATEWAY_DATABASE_PASSWORD ?? '',
    name: process.env.API_GATEWAY_DATABASE_NAME ?? '',
    schema: process.env.API_GATEWAY_DATABASE_SCHEMA ?? '',
  },
  cors: {
    enabled: toBoolean(process.env.API_GATEWAY_CORS_ENABLED, true),
    origins: toStringList(process.env.API_GATEWAY_CORS_ORIGINS, [
      process.env.FRONTEND_URL ?? 'http://localhost:3001',
    ]),
    credentials: toBoolean(process.env.API_GATEWAY_CORS_CREDENTIALS, true),
    methods: toStringList(process.env.API_GATEWAY_CORS_METHODS, [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ]),
    allowedHeaders: toStringList(process.env.API_GATEWAY_CORS_HEADERS, [
      'Authorization',
      'Content-Type',
      'X-Anonymous-Id',
      'X-Session-Id',
      'X-Request-Id',
      'X-Trace-Id',
    ]),
  },
  rateLimit: {
    enabled: toBoolean(process.env.API_GATEWAY_RATE_LIMIT_ENABLED, true),
    windowMs: toNumber(process.env.API_GATEWAY_RATE_LIMIT_WINDOW_MS, 60000),
    max: toNumber(process.env.API_GATEWAY_RATE_LIMIT_MAX, 120),
  },
  securityHeaders: {
    enabled: toBoolean(process.env.API_GATEWAY_SECURITY_HEADERS_ENABLED, true),
    hstsEnabled: toBoolean(process.env.API_GATEWAY_HSTS_ENABLED, false),
    contentSecurityPolicy:
      process.env.API_GATEWAY_CONTENT_SECURITY_POLICY ??
      "default-src 'self'; frame-ancestors 'none'; object-src 'none'",
  },
}));
