import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("canyon_next6_coverage")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("provider", "varchar(64)", (col) => col.notNull().defaultTo(""))
    .addColumn("repo_id", "varchar(512)", (col) => col.notNull().defaultTo(""))
    .addColumn("sha", "varchar(64)", (col) => col.notNull().defaultTo(""))
    .addColumn("build_target", "varchar(512)", (col) => col.notNull().defaultTo(""))
    .addColumn("instrument_cwd", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("canyon_next6_tag")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("tag", "jsonb", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // 内容寻址：相同 inputSourceMap 跨 build/SHA 只存一份
  await db.schema
    .createTable("canyon_next6_input_source_map")
    .addColumn("hash", "varchar(64)", (col) => col.primaryKey())
    .addColumn("source_map", "jsonb", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("canyon_next6_coverage_map")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("build_hash", "varchar(64)", (col) =>
      col.notNull().references("canyon_next6_coverage.id").onDelete("cascade"),
    )
    .addColumn("raw_file_path", "text", (col) => col.notNull())
    .addColumn("statement_map", "jsonb", (col) => col.notNull())
    .addColumn("input_source_map_hash", "varchar(64)", (col) =>
      col.references("canyon_next6_input_source_map.hash"),
    )
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex("canyon_next6_coverage_map_build_file_uq")
    .unique()
    .on("canyon_next6_coverage_map")
    .columns(["build_hash", "raw_file_path"])
    .execute();

  await db.schema
    .createTable("canyon_next6_coverage_hit")
    .addColumn("id", "varchar(64)", (col) => col.primaryKey())
    .addColumn("build_hash", "varchar(64)", (col) =>
      col.notNull().references("canyon_next6_coverage.id").onDelete("cascade"),
    )
    .addColumn("tag_key", "varchar(64)", (col) =>
      col.notNull().references("canyon_next6_tag.id").onDelete("cascade"),
    )
    .addColumn("raw_file_path", "text", (col) => col.notNull())
    .addColumn("s", "jsonb", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("canyon_next6_coverage_hit").ifExists().execute();
  await db.schema.dropTable("canyon_next6_coverage_map").ifExists().execute();
  await db.schema.dropTable("canyon_next6_input_source_map").ifExists().execute();
  await db.schema.dropTable("canyon_next6_tag").ifExists().execute();
  await db.schema.dropTable("canyon_next6_coverage").ifExists().execute();
}
