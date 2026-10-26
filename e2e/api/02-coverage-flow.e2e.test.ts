import "dotenv/config";
import type { Server } from "node:http";

import { serve } from "@hono/node-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  loadMergedCanyonOutput,
  toClientCoverage,
  uniqueBuildHash,
  withBuildHash,
  type CanyonFileEntry,
} from "../shared/canyon-output.js";
import { createCoverageSnapshot, postCoverageClient, waitForSnapshotTask } from "../shared/coverage-api.js";

/** 快照 coverage 全部语句命中之和（回溯后的源码侧） */
function totalStatementHits(
  coverage: Record<string, { s: Record<string, number> }> | null | undefined,
): number {
  if (!coverage) {
    return 0;
  }
  let total = 0;
  for (const file of Object.values(coverage)) {
    for (const n of Object.values(file.s ?? {})) {
      total += n;
    }
  }
  return total;
}

function assertRemappedSnapshot(
  coverage: Record<string, { path: string; s: Record<string, number>; buildHash: string }> | null,
  buildHash: string,
): void {
  expect(coverage).toBeTruthy();
  const paths = Object.keys(coverage!);
  expect(paths.length).toBeGreaterThan(0);
  expect(
    paths.some(
      (p) =>
        p.includes("/app/") ||
        p.includes("/src/") ||
        p.endsWith(".ts") ||
        p.endsWith(".tsx"),
    ),
  ).toBe(true);
  for (const file of Object.values(coverage!)) {
    expect(file.buildHash).toBe(buildHash);
    expect(file.path).toBeTruthy();
    expect(file.s).toEqual(expect.any(Object));
  }
  expect(totalStatementHits(coverage)).toBeGreaterThan(0);
}

const dbUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("e2e 需要 TEST_DATABASE_URL 或 DATABASE_URL（见 .env.example）");
}
process.env.DATABASE_URL = dbUrl;
process.env.SNAPSHOT_TASK_SLEEP_MS = "0";

const { createApp } = await import("../../services/api/src/app.js");
const { db } = await import("../../services/api/src/lib/db.js");
const { migrateTestDb } = await import("../../services/api/src/db/test-db.js");
const { coverageMapRowId } = await import("../../services/api/src/lib/coverage-map-id.js");
const { tagKey, normalizeTag } = await import("../../services/api/src/lib/tag.js");

const TAG_E2E_TEST = { source: "automation", type: "e2e", env: "test", trigger: "pipeline" };
const TAG_E2E_PROD = { source: "automation", type: "e2e", env: "prod", trigger: "pipeline" };
const TAG_UNIT_TEST = { source: "manual", type: "unit", env: "test", trigger: "local" };

/**
 * 顺序全流程：map/init → client 多 tag 上报 → 不同类型 tag 的快照。
 * 不清库；每次用唯一 buildHash，跑完可在 canyon_test 里直接查任务表。
 */
describe.sequential("coverage 全流程：init → client → snapshot", () => {
  let baseUrl: string;
  let server: Server;
  let payload: Record<string, CanyonFileEntry>;
  let buildHash: string;
  let fileCount: number;

  let coverageE2eTest: ReturnType<typeof toClientCoverage>;
  let coverageE2eProd: ReturnType<typeof toClientCoverage>;
  let coverageUnitTest: ReturnType<typeof toClientCoverage>;
  let coverageE2eTestSecond: ReturnType<typeof toClientCoverage>;

  let hitsAll = 0;
  let hitsTypeE2e = 0;
  let hitsEnvTest = 0;
  let hitsTypeUnit = 0;

  beforeAll(async () => {
    await migrateTestDb(db);

    const loaded = await loadMergedCanyonOutput();
    buildHash = uniqueBuildHash("e2e-flow");
    payload = withBuildHash(loaded.payload, buildHash);
    fileCount = Object.keys(payload).length;

    coverageE2eTest = toClientCoverage(payload, (key) => (Number(key) % 2 === 0 ? 1 : 0));
    coverageE2eProd = toClientCoverage(payload, (key) => (Number(key) % 2 === 1 ? 2 : 0));
    coverageUnitTest = toClientCoverage(payload, () => 3);
    coverageE2eTestSecond = toClientCoverage(payload, (key) => (Number(key) % 2 === 0 ? 4 : 0));

    const app = createApp();
    await new Promise<void>((resolve) => {
      server = serve(
        {
          fetch: app.fetch,
          hostname: "127.0.0.1",
          port: 0,
        },
        (info) => {
          baseUrl = `http://127.0.0.1:${info.port}`;
          resolve();
        },
      );
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("1) POST /coverage/map/init 写入 coverage / map / 共享 input_source_map", async () => {
    const res = await fetch(`${baseUrl}/coverage/map/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(201);

    const body = (await res.json()) as { buildHash: string; fileCount: number };
    expect(body.buildHash).toBe(buildHash);
    expect(body.fileCount).toBe(fileCount);

    const coverage = await db
      .selectFrom("canyon_next6_coverage")
      .selectAll()
      .where("id", "=", buildHash)
      .executeTakeFirst();
    expect(coverage).toBeDefined();
    expect(coverage!.instrument_cwd).toContain("real-app");

    const maps = await db
      .selectFrom("canyon_next6_coverage_map")
      .selectAll()
      .where("build_hash", "=", buildHash)
      .execute();
    expect(maps).toHaveLength(fileCount);

    const mainPath =
      Object.keys(payload).find((p) => p.endsWith("/main.js") || p.endsWith("\\main.js")) ??
      Object.keys(payload)[0]!;
    const mainRow = maps.find((row) => row.raw_file_path === mainPath);
    expect(mainRow).toBeDefined();
    expect(mainRow!.id).toBe(coverageMapRowId(buildHash, mainPath));
    expect(mainRow!.input_source_map_hash).toEqual(expect.any(String));

    const sourceMap = await db
      .selectFrom("canyon_next6_input_source_map")
      .selectAll()
      .where("hash", "=", mainRow!.input_source_map_hash!)
      .executeTakeFirst();
    expect(sourceMap!.source_map).toMatchObject({ version: 3 });
  });

  it("2) POST /coverage/client 用多种 type/env tag 上报命中", async () => {
    const r1 = await postCoverageClient(baseUrl, TAG_E2E_TEST, coverageE2eTest);
    expect(r1.status).toBe(201);
    expect(r1.body.buildHash).toBe(buildHash);
    expect(r1.body.tagKey).toBe(tagKey(normalizeTag(TAG_E2E_TEST)));
    expect(r1.body.hitCount).toBe(fileCount);

    const r2 = await postCoverageClient(baseUrl, TAG_E2E_PROD, coverageE2eProd);
    expect(r2.status).toBe(201);
    expect(r2.body.tagKey).toBe(tagKey(normalizeTag(TAG_E2E_PROD)));

    const r3 = await postCoverageClient(baseUrl, TAG_UNIT_TEST, coverageUnitTest);
    expect(r3.status).toBe(201);
    expect(r3.body.tagKey).toBe(tagKey(normalizeTag(TAG_UNIT_TEST)));

    const r4 = await postCoverageClient(baseUrl, TAG_E2E_TEST, coverageE2eTestSecond);
    expect(r4.status).toBe(201);
    expect(r4.body.tagKey).toBe(r1.body.tagKey);

    const tagKeys = await db
      .selectFrom("canyon_next6_coverage_hit")
      .select("tag_key")
      .where("build_hash", "=", buildHash)
      .distinct()
      .execute();
    expect(tagKeys).toHaveLength(3);

    const hitCount = await db
      .selectFrom("canyon_next6_coverage_hit")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("build_hash", "=", buildHash)
      .executeTakeFirst();
    expect(Number(hitCount!.count)).toBe(fileCount * 4);

    const builds = await fetch(`${baseUrl}/coverage/builds`);
    expect(builds.status).toBe(200);
    const list = (await builds.json()) as {
      items: Array<{ buildHash: string; tagCount: number; hitCount: number }>;
    };
    const row = list.items.find((i) => i.buildHash === buildHash);
    expect(row).toMatchObject({ tagCount: 3, hitCount: fileCount * 4 });
  });

  it("3) 快照（全部 tag）：压缩 hit，组装 map/sourcemap 并回溯源码后落库", async () => {
    const created = await createCoverageSnapshot(baseUrl, buildHash);
    expect(created.status).toBe(202);
    expect(created.taskId).toBeTruthy();

    const done = await waitForSnapshotTask(baseUrl, created.taskId!);
    expect(done.status).toBe("succeeded");
    expect(done.snapshotId).toBeTruthy();
    assertRemappedSnapshot(done.coverage, buildHash);
    hitsAll = totalStatementHits(done.coverage);

    const e2eTestKey = tagKey(normalizeTag(TAG_E2E_TEST));
    const e2eHits = await db
      .selectFrom("canyon_next6_coverage_hit")
      .selectAll()
      .where("build_hash", "=", buildHash)
      .where("tag_key", "=", e2eTestKey)
      .execute();
    expect(e2eHits).toHaveLength(fileCount);
    const samplePath = Object.keys(payload)[0]!;
    const sampleHit = e2eHits.find((h) => h.raw_file_path === samplePath);
    expect(sampleHit!.s).toMatchObject({
      "0": 5,
    });

    const hitRowCount = await db
      .selectFrom("canyon_next6_coverage_hit")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("build_hash", "=", buildHash)
      .executeTakeFirst();
    expect(Number(hitRowCount!.count)).toBe(fileCount * 3);
  });

  it("4) 快照筛选 type=e2e：只聚合 e2e/test + e2e/prod 再回溯", async () => {
    const created = await createCoverageSnapshot(baseUrl, buildHash, { type: "e2e" });
    expect(created.status).toBe(202);
    const done = await waitForSnapshotTask(baseUrl, created.taskId!);
    expect(done.status).toBe("succeeded");
    assertRemappedSnapshot(done.coverage, buildHash);
    hitsTypeE2e = totalStatementHits(done.coverage);
    expect(hitsTypeE2e).toBeLessThan(hitsAll);

    const unitKey = tagKey(normalizeTag(TAG_UNIT_TEST));
    const unitHits = await db
      .selectFrom("canyon_next6_coverage_hit")
      .selectAll()
      .where("build_hash", "=", buildHash)
      .where("tag_key", "=", unitKey)
      .execute();
    expect(unitHits).toHaveLength(fileCount);
    expect(unitHits[0]!.s).toMatchObject({ "0": 3 });
  });

  it("5) 快照筛选 env=test：聚合 e2e/test + unit/test 再回溯", async () => {
    const created = await createCoverageSnapshot(baseUrl, buildHash, { env: "test" });
    expect(created.status).toBe(202);
    const done = await waitForSnapshotTask(baseUrl, created.taskId!);
    expect(done.status).toBe("succeeded");
    assertRemappedSnapshot(done.coverage, buildHash);
    hitsEnvTest = totalStatementHits(done.coverage);
    expect(hitsEnvTest).toBeLessThan(hitsAll);
    expect(hitsEnvTest).not.toBe(hitsTypeE2e);
  });

  it("6) 快照筛选 type=unit：只聚合 unit/test 再回溯", async () => {
    const created = await createCoverageSnapshot(baseUrl, buildHash, { type: "unit" });
    expect(created.status).toBe(202);
    const done = await waitForSnapshotTask(baseUrl, created.taskId!);
    expect(done.status).toBe("succeeded");
    assertRemappedSnapshot(done.coverage, buildHash);
    hitsTypeUnit = totalStatementHits(done.coverage);
    expect(hitsTypeUnit).toBeLessThan(hitsAll);
    expect(hitsTypeUnit).toBeLessThan(hitsTypeE2e);
    expect(hitsTypeUnit).toBeLessThan(hitsEnvTest);
  });

  it("7) 同 buildHash 已有 running 任务时返回 409", async () => {
    const now = new Date();
    const runningId = uniqueBuildHash("e2e-running-task");
    await db
      .insertInto("canyon_next6_snapshot_task")
      .values({
        id: runningId,
        build_hash: buildHash,
        tag_filter: null,
        status: "running",
        error: null,
        snapshot_id: null,
        locked_by: "e2e-flow",
        created_at: now,
        started_at: now,
        finished_at: null,
      })
      .execute();

    const created = await createCoverageSnapshot(baseUrl, buildHash);
    expect(created.status).toBe(409);
    expect(created.body.taskId).toBe(runningId);
    expect(created.body.status).toBe("running");
  });
});
