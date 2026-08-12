const requiredSharedEnvKeys = [
  'APP_NAME',
  'PROMETHEUS_BASE_URL',
  'LOKI_BASE_URL',
] as const;

export function validateEnv(
  env: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const missingKeys = requiredSharedEnvKeys.filter((key) => !env[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required shared environment variables: ${missingKeys.join(', ')}`,
    );
  }

  return env;
}
