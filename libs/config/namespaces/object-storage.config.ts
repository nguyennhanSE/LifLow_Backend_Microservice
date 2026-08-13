import { registerAs } from '@nestjs/config';

const toBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const trimOrUndefined = (value: string | undefined): string | undefined => {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
};

export const objectStorageConfig = registerAs('objectStorage', () => ({
  provider: process.env.OBJECT_STORAGE_PROVIDER ?? 's3',
  endpoint: trimOrUndefined(process.env.OBJECT_STORAGE_ENDPOINT),
  accessKeyId:
    trimOrUndefined(process.env.AWS_ACCESS_KEY_ID) ??
    trimOrUndefined(process.env.OBJECT_STORAGE_ACCESS_KEY),
  secretAccessKey:
    trimOrUndefined(process.env.AWS_SECRET_ACCESS_KEY) ??
    trimOrUndefined(process.env.OBJECT_STORAGE_SECRET_KEY),
  region:
    trimOrUndefined(process.env.AWS_REGION) ??
    trimOrUndefined(process.env.OBJECT_STORAGE_REGION) ??
    'ap-northeast-2',
  bucket:
    trimOrUndefined(process.env.AWS_S3_BUCKET) ??
    trimOrUndefined(process.env.OBJECT_STORAGE_BUCKET_NAME) ??
    'liflow-bucket',
  forcePathStyle: toBoolean(process.env.OBJECT_STORAGE_FORCE_PATH_STYLE, false),
  useSsl: toBoolean(process.env.OBJECT_STORAGE_USE_SSL, true),
}));
