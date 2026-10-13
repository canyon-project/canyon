-- 由 `pnpm db:sql` 生成，请勿手改；修改 migrations 后重新执行该命令。
-- 迁移顺序: 202610121200_init_schema, 202610121600_client_snapshot
create table "canyon_next6_coverage" ("id" varchar(64) primary key, "provider" varchar(64) default '' not null, "repo_id" varchar(512) default '' not null, "sha" varchar(64) default '' not null, "build_target" varchar(512) default '' not null, "instrument_cwd" text default '' not null, "created_at" timestamptz default now() not null, "updated_at" timestamptz default now() not null);

create table "canyon_next6_tag" ("id" varchar(64) primary key, "tag" jsonb not null, "created_at" timestamptz default now() not null, "updated_at" timestamptz default now() not null);

create table "canyon_next6_input_source_map" ("hash" varchar(64) primary key, "source_map" jsonb not null, "created_at" timestamptz default now() not null);

create table "canyon_next6_coverage_map" ("id" varchar(64) primary key, "build_hash" varchar(64) not null references "canyon_next6_coverage" ("id") on delete cascade, "raw_file_path" text not null, "statement_map" jsonb not null, "input_source_map_hash" varchar(64) references "canyon_next6_input_source_map" ("hash"), "created_at" timestamptz default now() not null);

create unique index "canyon_next6_coverage_map_build_file_uq" on "canyon_next6_coverage_map" ("build_hash", "raw_file_path");

create table "canyon_next6_coverage_hit" ("id" varchar(64) primary key, "build_hash" varchar(64) not null references "canyon_next6_coverage" ("id") on delete cascade, "tag_key" varchar(64) not null references "canyon_next6_tag" ("id") on delete cascade, "raw_file_path" text not null, "s" jsonb not null, "created_at" timestamptz default now() not null);

create index "canyon_next6_coverage_hit_build_tag_file_idx" on "canyon_next6_coverage_hit" ("build_hash", "tag_key", "raw_file_path");

create table "canyon_next6_snapshot_task" ("id" varchar(64) primary key, "build_hash" varchar(64) not null references "canyon_next6_coverage" ("id") on delete cascade, "tag_filter" jsonb, "status" varchar(32) not null, "error" text, "snapshot_id" varchar(64), "locked_by" varchar(128), "created_at" timestamptz default now() not null, "started_at" timestamptz, "finished_at" timestamptz);

create index "canyon_next6_snapshot_task_build_status_idx" on "canyon_next6_snapshot_task" ("build_hash", "status");

create table "canyon_next6_snapshot" ("id" varchar(64) primary key, "build_hash" varchar(64) not null references "canyon_next6_coverage" ("id") on delete cascade, "tag_filter" jsonb, "task_id" varchar(64) not null references "canyon_next6_snapshot_task" ("id") on delete cascade, "coverage" jsonb not null, "created_at" timestamptz default now() not null);
