import { registerAs } from '@nestjs/config';

const trimOrUndefined = (value: string | undefined): string | undefined => {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
};

export const paymentConfig = registerAs('payment', () => ({
  toss: {
    clientKey: trimOrUndefined(process.env.TOSS_CLIENT_KEY),
    secretKey: trimOrUndefined(process.env.TOSS_SECRET_KEY),
    apiUrl:
      trimOrUndefined(process.env.TOSS_API_URL) ??
      'https://api.tosspayments.com/v1',
    webhookSecret: trimOrUndefined(process.env.TOSS_WEBHOOK_SECRET),
    successUrl:
      trimOrUndefined(process.env.TOSS_SUCCESS_URL) ??
      'http://localhost:3001/payment/success',
    failUrl:
      trimOrUndefined(process.env.TOSS_FAIL_URL) ??
      'http://localhost:3001/payment/fail',
  },
}));
