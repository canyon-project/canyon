import "dotenv/config";
import { PrismaClient } from "../../../generated/schema-sqlite/client";

const prisma = new PrismaClient();

export { prisma };

/** 初始化 SQLite 表（CREATE TABLE IF NOT EXISTS），应在启动时调用 */
export async function initPrismaSqlite(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS coverage_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'FAILED')),
      pid INTEGER,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$connect();
}
