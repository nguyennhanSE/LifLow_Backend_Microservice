import * as dotenv from 'dotenv';
import { defineConfig,env } from "prisma/config";

dotenv.config({ path: '.env' });

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile, override: true });

const service = process.env.PRISMA_SERVICE ?? "identity-service";
const schemaRoot = `libs/prisma/${service}.prisma`;

export default defineConfig({
  schema: `${schemaRoot}/schema.prisma`,
  migrations: {
    path: `${schemaRoot}/migrations`,
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
