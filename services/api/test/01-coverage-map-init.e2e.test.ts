import "dotenv/config";
import type { Server } from "node:http";

import { serve } from "@hono/node-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  loadMergedCanyonOutput,
  uniqueBuildHash,
  withBuildHash,
  type CanyonFileEntry,
} from "./helpers/canyon-output.js";

const dbUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("e2e 需要 TEST_DATABASE_URL 或 DATABASE_URL（见 .env.example）");
}
process.env.DATABASE_URL = dbUrl;

const { createApp } = await import("../src/app.js");
const { db } = await import("../src/lib/db.js");
const { migrateTestDb } = await import("../src/db/test-db.js");

/** map/init 边角：重复 init、跨 build 复用 input_source_map（不清库，留下数据） */
describe("POST /coverage/map/init 边角 (e2e)", () => {
  let baseUrl: string;
  let server: Server;

  beforeAll(async () => {
    await migrateTestDb(db);

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

  it("重复 init 同一 build 时 insert doNothing，不增加行数", async () => {
    const loaded = await loadMergedCanyonOutput();
    const buildHash = uniqueBuildHash("e2e-init-dup");
    const payload = withBuildHash(loaded.payload, buildHash);
    const raw = JSON.stringify(payload);

    const first = await fetch(`${baseUrl}/coverage/map/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });
    expect(first.status).toBe(201);

    const second = await fetch(`${baseUrl}/coverage/map/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });
    expect(second.status).toBe(201);

    const mapCount = await db
      .selectFrom("canyon_next6_coverage_map")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("build_hash", "=", buildHash)
      .executeTakeFirst();

    expect(Number(mapCount!.count)).toBe(Object.keys(payload).length);
  });

  it("不同 buildHash 复用相同 input_source_map 内容", async () => {
    const loaded = await loadMergedCanyonOutput();
    const buildHashA = uniqueBuildHash("e2e-init-a");
    const buildHashB = uniqueBuildHash("e2e-init-b");
    const payloadA = withBuildHash(loaded.payload, buildHashA);
    const fileCount = Object.keys(payloadA).length;

    const firstRes = await fetch(`${baseUrl}/coverage/map/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadA),
    });
    expect(firstRes.status).toBe(201);

    const hashesAfterFirst = await db
      .selectFrom("canyon_next6_coverage_map")
      .select("input_source_map_hash")
      .where("build_hash", "=", buildHashA)
      .where("input_source_map_hash", "is not", null)
      .execute();
    const uniqueHashes = new Set(hashesAfterFirst.map((r) => r.input_source_map_hash));
    expect(uniqueHashes.size).toBeGreaterThan(0);

    const payloadB: Record<string, CanyonFileEntry> = withBuildHash(loaded.payload, buildHashB);

    const secondRes = await fetch(`${baseUrl}/coverage/map/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadB),
    });
    expect(secondRes.status).toBe(201);

    const hashesAfterSecond = await db
      .selectFrom("canyon_next6_coverage_map")
      .select("input_source_map_hash")
      .where("build_hash", "=", buildHashB)
      .where("input_source_map_hash", "is not", null)
      .execute();

    // B 用到的 hash 都应已在 A 的集合里（内容寻址复用）
    for (const row of hashesAfterSecond) {
      expect(uniqueHashes.has(row.input_source_map_hash)).toBe(true);
    }

    const mapCountA = await db
      .selectFrom("canyon_next6_coverage_map")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("build_hash", "=", buildHashA)
      .executeTakeFirst();
    const mapCountB = await db
      .selectFrom("canyon_next6_coverage_map")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .where("build_hash", "=", buildHashB)
      .executeTakeFirst();
    expect(Number(mapCountA!.count)).toBe(fileCount);
    expect(Number(mapCountB!.count)).toBe(fileCount);
  });
});
