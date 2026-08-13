import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const identityServiceConfig = registerAs('identityService', () => ({
  port: toNumber(process.env.IDENTITY_SERVICE_PORT, 3501),
  database: {
    url:
      process.env.IDENTITY_SERVICE_DATABASE_URL ?? "",
    host:
      process.env.IDENTITY_SERVICE_DATABASE_HOST ?? "",
    port: toNumber(
      process.env.IDENTITY_SERVICE_DATABASE_PORT ?? '',
      5432
    ),
    username:
      process.env.IDENTITY_SERVICE_DATABASE_USERNAME ?? "",
    password:
      process.env.IDENTITY_SERVICE_DATABASE_PASSWORD ?? "",
    name:
      process.env.IDENTITY_SERVICE_DATABASE_NAME ?? 'postgres',
    schema:
      process.env.IDENTITY_SERVICE_DATABASE_SCHEMA ?? 'public',
  },
  password: {
    hashSaltLength: toNumber(process.env.HASH_SALT_LENGTH, 10),
  },
  oauth: {
    naver: {
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      redirectUri: process.env.NAVER_REDIRECT_URI,
    },
    kakao: {
      restApiKey: process.env.KAKAO_REST_API_KEY,
      javascriptKey: process.env.KAKAO_JAVASCRIPT_KEY,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      redirectUri: process.env.KAKAO_REDIRECT_URI,
    },
  },
}));
