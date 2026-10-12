import type { Kysely } from "kysely";

import type { Database } from "../db/types.js";

export type CoverageTagSummary = {
  tagKey: string;
  tag: unknown;
};

export type CoverageBuildRow = {
  buildHash: string;
  provider: string;
  repoId: string;
  sha: string;
  buildTarget: string;
  instrumentCwd: string;
  fileCount: number;
  hitCount: number;
  tagCount: number;
  tags: CoverageTagSummary[];
  createdAt: Date;
  updatedAt: Date;
};

export type SnapshotTaskSummary = {
  taskId: string;
  buildHash: string;
  status: string;
  tagFilter: unknown;
  snapshotId: string | null;
  error: string | null;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
};

/** 列出全部 coverage build，附带 map/hit 计数与关联 tag */
export async function listCoverageBuilds(db: Kysely<Database>): Promise<CoverageBuildRow[]> {
  const builds = await db
    .selectFrom("canyon_next6_coverage")
    .selectAll()
    .orderBy("updated_at", "desc")
    .execute();

  if (builds.length === 0) {
    return [];
  }

  const buildHashes = builds.map((b) => b.id);

  const mapCounts = await db
    .selectFrom("canyon_next6_coverage_map")
    .select(["build_hash"])
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("build_hash", "in", buildHashes)
    .groupBy("build_hash")
    .execute();

  const hitCounts = await db
    .selectFrom("canyon_next6_coverage_hit")
    .select(["build_hash"])
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("build_hash", "in", buildHashes)
    .groupBy("build_hash")
    .execute();

  const tagRows = await db
    .selectFrom("canyon_next6_coverage_hit as h")
    .innerJoin("canyon_next6_tag as t", "t.id", "h.tag_key")
    .select(["h.build_hash", "t.id as tag_key", "t.tag"])
    .where("h.build_hash", "in", buildHashes)
    .distinct()
    .execute();

  const fileCountByBuild = new Map(mapCounts.map((r) => [r.build_hash, Number(r.count)]));
  const hitCountByBuild = new Map(hitCounts.map((r) => [r.build_hash, Number(r.count)]));
  const tagsByBuild = new Map<string, CoverageTagSummary[]>();

  for (const row of tagRows) {
    const list = tagsByBuild.get(row.build_hash) ?? [];
    list.push({ tagKey: row.tag_key, tag: row.tag });
    tagsByBuild.set(row.build_hash, list);
  }

  return builds.map((b) => {
    const tags = tagsByBuild.get(b.id) ?? [];
    return {
      buildHash: b.id,
      provider: b.provider,
      repoId: b.repo_id,
      sha: b.sha,
      buildTarget: b.build_target,
      instrumentCwd: b.instrument_cwd,
      fileCount: fileCountByBuild.get(b.id) ?? 0,
      hitCount: hitCountByBuild.get(b.id) ?? 0,
      tagCount: tags.length,
      tags,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    };
  });
}

/** 某 build 下的快照任务列表（新到旧） */
export async function listSnapshotTasksByBuild(
  db: Kysely<Database>,
  buildHash: string,
): Promise<SnapshotTaskSummary[]> {
  const rows = await db
    .selectFrom("canyon_next6_snapshot_task")
    .selectAll()
    .where("build_hash", "=", buildHash)
    .orderBy("created_at", "desc")
    .execute();

  return rows.map((t) => ({
    taskId: t.id,
    buildHash: t.build_hash,
    status: t.status,
    tagFilter: t.tag_filter,
    snapshotId: t.snapshot_id,
    error: t.error,
    createdAt: t.created_at,
    startedAt: t.started_at,
    finishedAt: t.finished_at,
  }));
}
