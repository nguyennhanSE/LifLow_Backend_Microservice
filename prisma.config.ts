import "dotenv/config";
import { defineConfig } from "prisma/config";

const service = process.env.PRISMA_SERVICE ?? "identity-service";
const schemaRoot = `libs/prisma/${service}.prisma`;
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: `${schemaRoot}/schema.prisma`,
  migrations: {
    path: `${schemaRoot}/migrations`,
  },
  datasource: {
    url: databaseUrl,
  },
});
