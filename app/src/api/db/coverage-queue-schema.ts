import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** 本地覆盖率上报队列（原 prisma/schema-sqlite.prisma CoverageQueue） */
export const coverageQueue = sqliteTable("coverage_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  payload: text("payload").notNull(),
  status: text("status", { enum: ["PENDING", "PROCESSING", "FAILED"] })
    .notNull()
    .default("PENDING"),
  pid: integer("pid"),
  /** 与 DDL `DEFAULT CURRENT_TIMESTAMP` 一致；插入时若省略则由 DB 填，避免 Drizzle 写入 NULL */
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});
