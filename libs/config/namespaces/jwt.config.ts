import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_SECRET_ACCESS_TOKEN,
  refreshSecret: process.env.JWT_SECRET_REFRESH_TOKEN,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '1d',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
}));
