import { Hono } from "hono";

import { parseCoverageClientPayload } from "../lib/coverage-client-parse.js";
import { db } from "../lib/db.js";
import { CoverageMapInitError, parseIstanbulCoveragePayload } from "../lib/istanbul-coverage.js";
import { normalizeTagFilter } from "../lib/tag.js";
import { ingestCoverageClient } from "../services/coverage-client.js";
import { listCoverageBuilds, listSnapshotTasksByBuild } from "../services/coverage-list.js";
import { initCoverageMap } from "../services/coverage-map-init.js";
import {
  createSnapshotTask,
  getSnapshotTask,
  runSnapshotTask,
} from "../services/coverage-snapshot.js";

export const collectRoutes = new Hono();

/** 覆盖率 build 列表（含 tag） */
collectRoutes.get("/coverage/builds", async (c) => {
  try {
    const items = await listCoverageBuilds(db);
    return c.json({ items });
  } catch (err) {
    console.error(err);
    return c.json({ error: "服务器错误" }, 500);
  }
});

/** 某 build 的快照任务列表 */
collectRoutes.get("/coverage/builds/:buildHash/snapshot-tasks", async (c) => {
  const buildHash = c.req.param("buildHash");
  try {
    const items = await listSnapshotTasksByBuild(db, buildHash);
    return c.json({ items });
  } catch (err) {
    console.error(err);
    return c.json({ error: "服务器错误" }, 500);
  }
});

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 写入 istanbul 初始 coverage map（语句结构，不含命中合并） */
collectRoutes.post("/coverage/map/init", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "无效的 JSON" }, 400);
  }

  try {
    const { meta, files } = parseIstanbulCoveragePayload(body);
    const result = await initCoverageMap(db, meta, files);
    return c.json(result, 201);
  } catch (err) {
    if (err instanceof CoverageMapInitError) {
      return c.json({ error: err.message }, err.status as 400);
    }
    console.error(err);
    return c.json({ error: "服务器错误" }, 500);
  }
});

/** 上报命中：携带 tag，直接 insert hit */
collectRoutes.post("/coverage/client", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "无效的 JSON" }, 400);
  }

  try {
    const parsed = parseCoverageClientPayload(body);
    const result = await ingestCoverageClient(db, parsed);
    return c.json(result, 201);
  } catch (err) {
    if (err instanceof CoverageMapInitError) {
      return c.json({ error: err.message }, err.status as 400);
    }
    console.error(err);
    return c.json({ error: "服务器错误" }, 500);
  }
});

/** 创建快照长任务（202）；同 buildHash 已有 running → 409 */
collectRoutes.post("/coverage/snapshot", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "无效的 JSON" }, 400);
  }

  if (!isPlainObject(body) || typeof body.buildHash !== "string" || !body.buildHash) {
    return c.json({ error: "缺少 buildHash" }, 400);
  }

  const tagFilter = body.tag === undefined ? null : normalizeTagFilter(body.tag);

  try {
    const created = await createSnapshotTask(db, body.buildHash, tagFilter);
    if (!created.ok) {
      return c.json(
        {
          error: "同 buildHash 已有快照任务在执行",
          taskId: created.taskId,
          status: created.status,
        },
        409,
      );
    }

    // 后台执行，不阻塞响应
    void runSnapshotTask(db, created.taskId).catch((err) => {
      console.error("snapshot task failed", created.taskId, err);
    });

    return c.json({ taskId: created.taskId, status: created.status }, 202);
  } catch (err) {
    if (err instanceof CoverageMapInitError) {
      return c.json({ error: err.message }, err.status as 400);
    }
    console.error(err);
    return c.json({ error: "服务器错误" }, 500);
  }
});

/** 查询快照任务状态 */
collectRoutes.get("/coverage/snapshot/tasks/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  try {
    const view = await getSnapshotTask(db, taskId);
    if (!view) {
      return c.json({ error: "任务不存在" }, 404);
    }
    return c.json(view);
  } catch (err) {
    console.error(err);
    return c.json({ error: "服务器错误" }, 500);
  }
});
