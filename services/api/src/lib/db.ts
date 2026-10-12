import "dotenv/config";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "../db/types.js";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return url;
}

export const pool = new Pool({
  connectionString: getDatabaseUrl(),
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});
