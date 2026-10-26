import "dotenv/config";
import type { Server } from "node:http";

import { expect, test } from "@playwright/test";
import { serve } from "@hono/node-server";

import {
  loadMergedCanyonOutput,
  toClientCoverage,
  uniqueBuildHash,
  withBuildHash,
} from "../../shared/canyon-output.js";
import {
  createCoverageSnapshot,
  postCoverageClient,
  waitForSnapshotTask,
} from "../../shared/coverage-api.js";
import { TAG_E2E_PIPELINE } from "../../shared/tags.js";

const dbUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("e2e 需要 TEST_DATABASE_URL 或 DATABASE_URL");
}
process.env.DATABASE_URL = dbUrl;
process.env.SNAPSHOT_TASK_SLEEP_MS = "0";

const { createApp } = await import("../../../services/api/src/app.js");
const { db } = await import("../../../services/api/src/lib/db.js");
const { migrateTestDb } = await import("../../../services/api/src/db/test-db.js");

let apiBaseUrl: string;
let server: Server;
let buildHash: string;

test.beforeAll(async () => {
  await migrateTestDb(db);

  const loaded = await loadMergedCanyonOutput();
  buildHash = uniqueBuildHash("e2e-pipeline");
  const payload = withBuildHash(loaded.payload, buildHash);

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = serve(
      { fetch: app.fetch, hostname: "127.0.0.1", port: 0 },
      (info) => {
        apiBaseUrl = `http://127.0.0.1:${info.port}`;
        resolve();
      },
    );
  });

  const initRes = await fetch(`${apiBaseUrl}/coverage/map/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  expect(initRes.status).toBe(201);
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("Playwright 操作 + client 上报 + 快照回溯（CI 链路）", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("今天要做什么？");
  await input.fill("覆盖率 e2e");
  await input.press("Enter");
  await expect(page.getByText("覆盖率 e2e")).toBeVisible();

  const loaded = await loadMergedCanyonOutput();
  const payload = withBuildHash(loaded.payload, buildHash);
  const coverage = toClientCoverage(payload, (key) => (Number(key) % 3 === 0 ? 1 : 0));

  const clientRes = await postCoverageClient(apiBaseUrl, { ...TAG_E2E_PIPELINE }, coverage);
  expect(clientRes.status).toBe(201);

  const created = await createCoverageSnapshot(apiBaseUrl, buildHash, { type: "e2e" });
  expect(created.status).toBe(202);

  const done = await waitForSnapshotTask(apiBaseUrl, created.taskId!);
  expect(done.status).toBe("succeeded");
  expect(done.coverage).toBeTruthy();

  const paths = Object.keys(done.coverage!);
  expect(
    paths.some((p) => p.includes("/app/") || p.endsWith(".ts")),
  ).toBe(true);

  let hits = 0;
  for (const file of Object.values(done.coverage!)) {
    for (const n of Object.values(file.s ?? {})) {
      hits += n;
    }
  }
  expect(hits).toBeGreaterThan(0);
});
