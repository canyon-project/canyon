import "dotenv/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";

import * as schema from "@/api/db/coverage-queue-schema.ts";

/** 与 prisma schema-sqlite 默认一致：`file:local.db` → 进程 cwd 下 `local.db` */
const dbPath = process.env.SQLITE_QUEUE_PATH ?? path.join(process.cwd(), "local.db");

const sqlite = new Database(dbPath);

export const sqliteQueueDb = drizzle(sqlite, { schema });

/** 初始化 SQLite 队列表（CREATE TABLE IF NOT EXISTS），应在启动时调用 */
export async function initSqliteQueue(): Promise<void> {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS coverage_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'FAILED')),
      pid INTEGER,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
