import * as dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({ path: '.env' });

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile, override: true });

const service = process.env.PRISMA_SERVICE ?? 'identity-service';
const databaseUrl = `${service.replace(/-/g, '_').toUpperCase()}_DATABASE_URL`;
const schemaRoot = `libs/prisma/${service}.prisma`;

export default defineConfig({
  schema: `${schemaRoot}/schema.prisma`,
  migrations: {
    path: `${schemaRoot}/migrations`,
  },
  datasource: {
    url: env(databaseUrl),
  },
});
