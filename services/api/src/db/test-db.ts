import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Kysely, PostgresDialect } from "kysely";
import { sql } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import { Pool } from "pg";

import type { Database } from "./types.js";

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

export function createTestPool(connectionString: string): Pool {
  return new Pool({ connectionString });
}

export function createTestDb(pool: Pool): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });
}

export async function migrateTestDb(db: Kysely<Database>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: migrationsDir,
    }),
  });
  const { error } = await migrator.migrateToLatest();
  if (error) {
    throw error;
  }
}

/** 清空覆盖率相关表，便于 e2e 隔离 */
export async function truncateCoverageTables(db: Kysely<Database>): Promise<void> {
  await sql`
    TRUNCATE TABLE
      canyon_next6_snapshot,
      canyon_next6_snapshot_task,
      canyon_next6_coverage_hit,
      canyon_next6_coverage_map,
      canyon_next6_input_source_map,
      canyon_next6_tag,
      canyon_next6_coverage
    RESTART IDENTITY CASCADE
  `.execute(db);
}
