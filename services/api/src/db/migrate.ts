import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Kysely, PostgresDialect } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),
  }),
});

const direction = process.argv[2] ?? "latest";

const { error, results } =
  direction === "down" ? await migrator.migrateDown() : await migrator.migrateToLatest();

results?.forEach((result) => {
  const tag = result.direction === "Up" ? "migrated" : "rolled back";
  if (result.status === "Success") {
    console.log(`${tag}: ${result.migrationName}`);
  } else if (result.status === "Error") {
    console.error(`failed: ${result.migrationName}`);
  }
});

if (error) {
  console.error("Migration failed");
  console.error(error);
  await db.destroy();
  process.exit(1);
}

await db.destroy();
