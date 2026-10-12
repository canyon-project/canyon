import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type JsonColumn = ColumnType<Json, Json | string, Json | string>;

/** canyon_next6_coverage — id = buildHash */
export interface CoverageTable {
  id: string;
  provider: string;
  repo_id: string;
  sha: string;
  build_target: string;
  instrument_cwd: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * canyon_next6_tag — id = tagKey = hash(source + type + env + trigger)
 * tag: { source, type, env, trigger }
 */
export interface TagTable {
  id: string;
  tag: JsonColumn;
  created_at: Date;
  updated_at: Date;
}

/**
 * canyon_next6_input_source_map — 内容寻址的 Istanbul inputSourceMap
 * hash = sha256(stableStringify(source_map))
 */
export interface InputSourceMapTable {
  hash: string;
  source_map: JsonColumn;
  created_at: Date;
}

/** canyon_next6_coverage_map — 构建级语句覆盖率地图（与 tag 无关；暂不存 fn/branch map） */
export interface CoverageMapTable {
  id: string;
  build_hash: string;
  raw_file_path: string;
  statement_map: JsonColumn;
  input_source_map_hash: string | null;
  created_at: Date;
}

/** canyon_next6_coverage_hit — 按 build + tag + file 存语句命中（istanbul `s`；暂不存 f/b） */
export interface CoverageHitTable {
  id: string;
  build_hash: string;
  tag_key: string;
  raw_file_path: string;
  s: JsonColumn;
  created_at: Date;
}

export type SnapshotTaskStatus = "pending" | "running" | "succeeded" | "failed" | "rejected";

/** canyon_next6_snapshot_task — 快照长任务 */
export interface SnapshotTaskTable {
  id: string;
  build_hash: string;
  tag_filter: JsonColumn | null;
  status: SnapshotTaskStatus;
  error: string | null;
  snapshot_id: string | null;
  locked_by: string | null;
  created_at: Date;
  started_at: Date | null;
  finished_at: Date | null;
}

/** canyon_next6_snapshot — 快照结果（仅 path / s / buildHash） */
export interface SnapshotTable {
  id: string;
  build_hash: string;
  tag_filter: JsonColumn | null;
  task_id: string;
  coverage: JsonColumn;
  created_at: Date;
}

export interface Database {
  canyon_next6_coverage: CoverageTable;
  canyon_next6_tag: TagTable;
  canyon_next6_input_source_map: InputSourceMapTable;
  canyon_next6_coverage_map: CoverageMapTable;
  canyon_next6_coverage_hit: CoverageHitTable;
  canyon_next6_snapshot_task: SnapshotTaskTable;
  canyon_next6_snapshot: SnapshotTable;
}

export type Coverage = Selectable<CoverageTable>;
export type NewCoverage = Insertable<CoverageTable>;
export type CoverageUpdate = Updateable<CoverageTable>;

export type Tag = Selectable<TagTable>;
export type NewTag = Insertable<TagTable>;
export type TagUpdate = Updateable<TagTable>;

export type InputSourceMap = Selectable<InputSourceMapTable>;
export type NewInputSourceMap = Insertable<InputSourceMapTable>;

export type CoverageMap = Selectable<CoverageMapTable>;
export type NewCoverageMap = Insertable<CoverageMapTable>;

export type CoverageHit = Selectable<CoverageHitTable>;
export type NewCoverageHit = Insertable<CoverageHitTable>;

export type SnapshotTask = Selectable<SnapshotTaskTable>;
export type NewSnapshotTask = Insertable<SnapshotTaskTable>;
export type SnapshotTaskUpdate = Updateable<SnapshotTaskTable>;

export type Snapshot = Selectable<SnapshotTable>;
export type NewSnapshot = Insertable<SnapshotTable>;
