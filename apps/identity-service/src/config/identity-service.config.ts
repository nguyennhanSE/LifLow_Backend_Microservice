import { registerAs } from '@nestjs/config';

const toNumber = (value: string | undefined, defaultValue: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
};

export const identityServiceConfig = registerAs('identityService', () => ({
  database: {
    url:
      process.env.IDENTITY_SERVICE_DATABASE_URL ??
      process.env.IDENTITY_DATABASE_URL ??
      process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: toNumber(process.env.DATABASE_PORT, 5432),
    username: process.env.DATABASE_USERNAME ?? 'postgres',
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME ?? 'postgres',
    schema: process.env.DATABASE_SCHEMA ?? 'public',
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
