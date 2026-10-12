import { randomUUID } from "node:crypto";
import { hostname } from "node:os";

import {
  assembleInstrumentCoverage,
  remapToSourceSnapshot,
  type SnapshotFileCoverage,
} from "@canyon/data";
import type { Kysely } from "kysely";
import { sql } from "kysely";

import type { Database, Json, SnapshotTaskStatus } from "../db/types.js";
import { CoverageMapInitError } from "../lib/istanbul-coverage.js";
import { mergeStatementHits } from "../lib/merge-hits.js";
import type { CoverageTag } from "../lib/tag.js";

const STALE_RUNNING_MS = 30 * 60 * 1000;
const DEFAULT_SNAPSHOT_SLEEP_MS = 10_000;

/** 快照任务执行中的额外等待；默认 10s，可用 SNAPSHOT_TASK_SLEEP_MS 覆盖 */
function snapshotTaskSleepMs(): number {
  const raw = process.env.SNAPSHOT_TASK_SLEEP_MS;
  if (raw === undefined || raw === "") {
    return DEFAULT_SNAPSHOT_SLEEP_MS;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_SNAPSHOT_SLEEP_MS;
}

export type CreateSnapshotResult =
  | { ok: true; taskId: string; status: SnapshotTaskStatus }
  | { ok: false; conflict: true; taskId: string; status: SnapshotTaskStatus };

export type SnapshotTaskView = {
  taskId: string;
  buildHash: string;
  status: SnapshotTaskStatus;
  tagFilter: unknown;
  error: string | null;
  snapshotId: string | null;
  coverage: unknown | null;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
};

function workerId(): string {
  return `${hostname()}:${process.pid}`;
}

function isStale(startedAt: Date | null): boolean {
  if (!startedAt) {
    return true;
  }
  return Date.now() - startedAt.getTime() > STALE_RUNNING_MS;
}

/** 回收超时的 running 任务 */
async function reclaimStaleRunning(db: Kysely<Database>, buildHash: string): Promise<void> {
  const running = await db
    .selectFrom("canyon_next6_snapshot_task")
    .selectAll()
    .where("build_hash", "=", buildHash)
    .where("status", "=", "running")
    .execute();

  const now = new Date();
  for (const task of running) {
    if (isStale(task.started_at)) {
      await db
        .updateTable("canyon_next6_snapshot_task")
        .set({
          status: "failed",
          error: "任务超时被回收",
          finished_at: now,
          locked_by: null,
        })
        .where("id", "=", task.id)
        .where("status", "=", "running")
        .execute();
    }
  }
}

/**
 * 创建快照任务；同 buildHash 已有未超时 running 时返回 409 信息。
 * 成功创建后由调用方 fire-and-forget `runSnapshotTask`。
 */
export async function createSnapshotTask(
  db: Kysely<Database>,
  buildHash: string,
  tagFilter: Partial<CoverageTag> | null,
): Promise<CreateSnapshotResult> {
  const coverage = await db
    .selectFrom("canyon_next6_coverage")
    .select("id")
    .where("id", "=", buildHash)
    .executeTakeFirst();

  if (!coverage) {
    throw new CoverageMapInitError(400, `buildHash 不存在: ${buildHash}`);
  }

  await reclaimStaleRunning(db, buildHash);

  const active = await db
    .selectFrom("canyon_next6_snapshot_task")
    .selectAll()
    .where("build_hash", "=", buildHash)
    .where("status", "=", "running")
    .executeTakeFirst();

  if (active && !isStale(active.started_at)) {
    return { ok: false, conflict: true, taskId: active.id, status: active.status };
  }

  const taskId = randomUUID();
  const now = new Date();

  await db
    .insertInto("canyon_next6_snapshot_task")
    .values({
      id: taskId,
      build_hash: buildHash,
      tag_filter: (tagFilter as Json | null) ?? null,
      status: "pending",
      error: null,
      snapshot_id: null,
      locked_by: null,
      created_at: now,
      started_at: null,
      finished_at: null,
    })
    .execute();

  return { ok: true, taskId, status: "pending" };
}

/** 查询任务状态；成功时附带 coverage */
export async function getSnapshotTask(
  db: Kysely<Database>,
  taskId: string,
): Promise<SnapshotTaskView | null> {
  const task = await db
    .selectFrom("canyon_next6_snapshot_task")
    .selectAll()
    .where("id", "=", taskId)
    .executeTakeFirst();

  if (!task) {
    return null;
  }

  let coverage: unknown | null = null;
  if (task.snapshot_id) {
    const snap = await db
      .selectFrom("canyon_next6_snapshot")
      .select("coverage")
      .where("id", "=", task.snapshot_id)
      .executeTakeFirst();
    coverage = snap?.coverage ?? null;
  }

  return {
    taskId: task.id,
    buildHash: task.build_hash,
    status: task.status,
    tagFilter: task.tag_filter,
    error: task.error,
    snapshotId: task.snapshot_id,
    coverage,
    createdAt: task.created_at,
    startedAt: task.started_at,
    finishedAt: task.finished_at,
  };
}

/** 解析筛选范围内的 tag_key 列表 */
async function resolveTagKeys(
  db: Kysely<Database>,
  buildHash: string,
  tagFilter: unknown,
): Promise<string[]> {
  if (tagFilter != null && typeof tagFilter === "object" && !Array.isArray(tagFilter)) {
    const rows = await sql<{ tag_key: string }>`
      SELECT DISTINCT h.tag_key
      FROM canyon_next6_coverage_hit h
      INNER JOIN canyon_next6_tag t ON t.id = h.tag_key
      WHERE h.build_hash = ${buildHash}
        AND t.tag @> ${JSON.stringify(tagFilter)}::jsonb
    `.execute(db);
    return rows.rows.map((r) => r.tag_key);
  }

  const rows = await db
    .selectFrom("canyon_next6_coverage_hit")
    .select("tag_key")
    .where("build_hash", "=", buildHash)
    .distinct()
    .execute();
  return rows.map((r) => r.tag_key);
}

type HitRow = {
  id: string;
  tag_key: string;
  raw_file_path: string;
  s: unknown;
};

/** 压缩同一 build+tagKey+file 的多行 hit */
async function compactHits(
  db: Kysely<Database>,
  buildHash: string,
  tagKeys: string[],
): Promise<void> {
  if (tagKeys.length === 0) {
    return;
  }

  const hits = await db
    .selectFrom("canyon_next6_coverage_hit")
    .select(["id", "tag_key", "raw_file_path", "s"])
    .where("build_hash", "=", buildHash)
    .where("tag_key", "in", tagKeys)
    .execute();

  const groups = new Map<string, HitRow[]>();
  for (const hit of hits) {
    const key = `${hit.tag_key}\0${hit.raw_file_path}`;
    const list = groups.get(key) ?? [];
    list.push(hit);
    groups.set(key, list);
  }

  const now = new Date();

  for (const group of groups.values()) {
    if (group.length <= 1) {
      continue;
    }

    const merged = mergeStatementHits(...group.map((g) => g.s));
    const ids = group.map((g) => g.id);
    const first = group[0]!;

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom("canyon_next6_coverage_hit").where("id", "in", ids).execute();
      await trx
        .insertInto("canyon_next6_coverage_hit")
        .values({
          id: randomUUID(),
          build_hash: buildHash,
          tag_key: first.tag_key,
          raw_file_path: first.raw_file_path,
          s: merged as unknown as Json,
          created_at: now,
        })
        .execute();
    });
  }
}

/**
 * 跨 tag 合并 hit，再与 map / inputSourceMap 组装，
 * 经 source map 回溯为源码覆盖率后返回快照结构。
 */
async function buildSnapshotCoverage(
  db: Kysely<Database>,
  buildHash: string,
  tagKeys: string[],
): Promise<Record<string, SnapshotFileCoverage>> {
  if (tagKeys.length === 0) {
    return {};
  }

  const hits = await db
    .selectFrom("canyon_next6_coverage_hit")
    .select(["raw_file_path", "s"])
    .where("build_hash", "=", buildHash)
    .where("tag_key", "in", tagKeys)
    .execute();

  const byPath = new Map<string, Record<string, number>>();
  for (const hit of hits) {
    const prev = byPath.get(hit.raw_file_path) ?? {};
    byPath.set(hit.raw_file_path, mergeStatementHits(prev, hit.s));
  }

  if (byPath.size === 0) {
    return {};
  }

  const paths = [...byPath.keys()];
  const mapRows = await db
    .selectFrom("canyon_next6_coverage_map as m")
    .leftJoin("canyon_next6_input_source_map as ism", "ism.hash", "m.input_source_map_hash")
    .select(["m.raw_file_path", "m.statement_map", "ism.source_map as input_source_map"])
    .where("m.build_hash", "=", buildHash)
    .where("m.raw_file_path", "in", paths)
    .execute();

  const mapByPath = new Map(mapRows.map((row) => [row.raw_file_path, row]));

  const assembleInputs = [];
  for (const [filePath, s] of byPath) {
    const mapRow = mapByPath.get(filePath);
    if (!mapRow) {
      // 无 map 无法回溯，跳过（正常应先 map/init）
      continue;
    }
    assembleInputs.push({
      path: filePath,
      statementMap: mapRow.statement_map,
      s,
      inputSourceMap: mapRow.input_source_map ?? null,
      buildHash,
    });
  }

  const instrumentCoverage = assembleInstrumentCoverage(assembleInputs);
  return remapToSourceSnapshot(instrumentCoverage, buildHash);
}

/**
 * 执行快照任务：advisory lock → 压缩 hit → 组装 map/sourcemap → 回溯源码 → 写 snapshot。
 * 适合 fire-and-forget 调用。
 * 全程占用同一连接，保证会话级 advisory lock 的 lock/unlock 配对。
 */
export async function runSnapshotTask(db: Kysely<Database>, taskId: string): Promise<void> {
  await db.connection().execute(async (conn) => {
    const task = await conn
      .selectFrom("canyon_next6_snapshot_task")
      .selectAll()
      .where("id", "=", taskId)
      .executeTakeFirst();

    if (!task || (task.status !== "pending" && task.status !== "running")) {
      return;
    }

    const buildHash = task.build_hash;
    const lockedBy = workerId();

    const lockResult = await sql<{ locked: boolean }>`
      SELECT pg_try_advisory_lock(hashtext(${buildHash})) AS locked
    `.execute(conn);
    const locked = Boolean(lockResult.rows[0]?.locked);

    if (!locked) {
      await conn
        .updateTable("canyon_next6_snapshot_task")
        .set({
          status: "rejected",
          error: "未能获取 buildHash 锁",
          finished_at: new Date(),
        })
        .where("id", "=", taskId)
        .where("status", "=", "pending")
        .execute();
      return;
    }

    try {
      await reclaimStaleRunning(conn, buildHash);

      const otherRunning = await conn
        .selectFrom("canyon_next6_snapshot_task")
        .select("id")
        .where("build_hash", "=", buildHash)
        .where("status", "=", "running")
        .where("id", "!=", taskId)
        .executeTakeFirst();

      if (otherRunning) {
        await conn
          .updateTable("canyon_next6_snapshot_task")
          .set({
            status: "rejected",
            error: "同 buildHash 已有任务在执行",
            finished_at: new Date(),
          })
          .where("id", "=", taskId)
          .execute();
        return;
      }

      const claimed = await conn
        .updateTable("canyon_next6_snapshot_task")
        .set({
          status: "running",
          locked_by: lockedBy,
          started_at: new Date(),
          error: null,
        })
        .where("id", "=", taskId)
        .where("status", "in", ["pending", "running"])
        .returning("id")
        .executeTakeFirst();

      if (!claimed) {
        return;
      }

      // 模拟长任务：默认 sleep 10s（测试可设 SNAPSHOT_TASK_SLEEP_MS=0）
      const sleepMs = snapshotTaskSleepMs();
      if (sleepMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, sleepMs));
      }

      const tagKeys = await resolveTagKeys(conn, buildHash, task.tag_filter);
      await compactHits(conn, buildHash, tagKeys);
      const coverage = await buildSnapshotCoverage(conn, buildHash, tagKeys);

      const snapshotId = randomUUID();
      const now = new Date();

      await conn.transaction().execute(async (trx) => {
        await trx
          .insertInto("canyon_next6_snapshot")
          .values({
            id: snapshotId,
            build_hash: buildHash,
            tag_filter: task.tag_filter,
            task_id: taskId,
            coverage: coverage as unknown as Json,
            created_at: now,
          })
          .execute();

        await trx
          .updateTable("canyon_next6_snapshot_task")
          .set({
            status: "succeeded",
            snapshot_id: snapshotId,
            finished_at: now,
            locked_by: null,
          })
          .where("id", "=", taskId)
          .execute();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await conn
        .updateTable("canyon_next6_snapshot_task")
        .set({
          status: "failed",
          error: message,
          finished_at: new Date(),
          locked_by: null,
        })
        .where("id", "=", taskId)
        .execute();
    } finally {
      await sql`SELECT pg_advisory_unlock(hashtext(${buildHash}))`.execute(conn);
    }
  });
}
