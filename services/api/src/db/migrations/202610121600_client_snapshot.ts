import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createIndex("canyon_next6_coverage_hit_build_tag_file_idx")
    .on("canyon_next6_coverage_hit")
    .columns(["build_hash", "tag_key", "raw_file_path"])
    .execute();

  await db.schema
    .createTable("canyon_next6_snapshot_task")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("build_hash", "varchar(64)", (col) =>
      col.notNull().references("canyon_next6_coverage.id").onDelete("cascade"),
    )
    .addColumn("tag_filter", "jsonb")
    .addColumn("status", "varchar(32)", (col) => col.notNull())
    .addColumn("error", "text")
    .addColumn("snapshot_id", "varchar(64)")
    .addColumn("locked_by", "varchar(128)")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("started_at", "timestamptz")
    .addColumn("finished_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("canyon_next6_snapshot_task_build_status_idx")
    .on("canyon_next6_snapshot_task")
    .columns(["build_hash", "status"])
    .execute();

  await db.schema
    .createTable("canyon_next6_snapshot")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("build_hash", "varchar(64)", (col) =>
      col.notNull().references("canyon_next6_coverage.id").onDelete("cascade"),
    )
    .addColumn("tag_filter", "jsonb")
    .addColumn("task_id", "varchar(64)", (col) =>
      col.notNull().references("canyon_next6_snapshot_task.id").onDelete("cascade"),
    )
    .addColumn("coverage", "jsonb", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // snapshot.task_id → task；task.snapshot_id 仅作回写指针，不加 FK 以免循环依赖
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("canyon_next6_snapshot").ifExists().execute();
  await db.schema.dropTable("canyon_next6_snapshot_task").ifExists().execute();
  await db.schema.dropIndex("canyon_next6_coverage_hit_build_tag_file_idx").ifExists().execute();
}
