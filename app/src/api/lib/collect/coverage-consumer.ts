import { prisma } from "@/api/lib/prisma.ts";
import { prisma as prismaSqlite } from "@/api/lib/prisma-sqlite.ts";
import { acquireLock, releaseLock } from "./coverage-lock.ts";
import { addMaps, ensureNumMap } from "./coverage-merge.util.ts";

interface CoverageQueuePayload {
  coverage: Record<
    string,
    {
      s?: Record<string, number>;
      f?: Record<string, number>;
      b?: Record<string, unknown>;
      inputSourceMap?: number;
    }
  >;
  buildHash: string;
  sceneKey: string;
}

const QUERY_LIMIT = Number(process.env.COVERAGE_CONSUMER_QUERY_LIMIT || 100);
const currentPid = process.pid!;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mergeLocalCoverageData(): Promise<void> {
  try {
    const pendingItems = await prismaSqlite.coverageQueue.findMany({
      where: {
        status: "PENDING",
        OR: [{ pid: null }, { pid: currentPid }],
      },
      orderBy: { createdAt: "asc" },
    });

    if (pendingItems.length <= 1) return;

    const coverageGroups = new Map<string, Array<{ id: number; payload: CoverageQueuePayload }>>();

    for (const item of pendingItems) {
      let payload: CoverageQueuePayload;
      try {
        payload = JSON.parse(item.payload as string) as CoverageQueuePayload;
      } catch {
        continue;
      }
      if (!payload || typeof payload !== "object") continue;

      const { buildHash, sceneKey, coverage } = payload;
      if (!buildHash || !sceneKey || !coverage || typeof coverage !== "object") continue;

      const coverageID = `${buildHash}|${sceneKey}`;
      if (!coverageGroups.has(coverageID)) coverageGroups.set(coverageID, []);
      coverageGroups.get(coverageID)!.push({ id: item.id, payload });
    }

    for (const [, items] of coverageGroups.entries()) {
      if (items.length <= 1) continue;

      const mergedCoverage: CoverageQueuePayload["coverage"] = {};
      let buildHash = "";
      let sceneKey = "";

      for (const item of items) {
        const p = item.payload;
        if (!p?.buildHash || !p?.sceneKey || !p?.coverage || typeof p.coverage !== "object")
          continue;

        buildHash = p.buildHash;
        sceneKey = p.sceneKey;

        for (const [filePath, entry] of Object.entries(p.coverage)) {
          if (!mergedCoverage[filePath]) {
            mergedCoverage[filePath] = { s: {}, f: {}, b: {} };
          }
          const merged = mergedCoverage[filePath];
          const sMap = ensureNumMap(entry?.s || {});
          const fMap = ensureNumMap(entry?.f || {});
          merged.s = addMaps(ensureNumMap(merged.s), sMap);
          merged.f = addMaps(ensureNumMap(merged.f), fMap);
          if (entry?.inputSourceMap) merged.inputSourceMap = entry.inputSourceMap;
        }
      }

      if (Object.keys(mergedCoverage).length === 0 || !buildHash || !sceneKey) continue;

      const mergedPayload: CoverageQueuePayload = { coverage: mergedCoverage, buildHash, sceneKey };
      const idsToDelete = items.map((i) => i.id);
      const [firstId, ...otherIds] = idsToDelete;

      await prismaSqlite.coverageQueue.update({
        where: { id: firstId },
        data: { payload: JSON.stringify(mergedPayload), pid: currentPid },
      });

      if (otherIds.length > 0) {
        await prismaSqlite.coverageQueue.deleteMany({
          where: { id: { in: otherIds } },
        });
      }
    }
  } catch {
    // 不抛出错误
  }
}

async function mergeCoverageData(
  coverage: CoverageQueuePayload["coverage"],
  buildHash: string,
  sceneKey: string,
): Promise<void> {
  const now = new Date();

  for (const [filePath, entry] of Object.entries(coverage)) {
    try {
      const id = `${buildHash}|${sceneKey}|${filePath}`;
      const s = ensureNumMap(entry?.s || {});
      const f = ensureNumMap(entry?.f || {});

      const existing = await prisma.coverageHit.findUnique({
        where: { id },
        select: { s: true, f: true },
      });

      let mergedS = s;
      let mergedF = f;
      if (existing) {
        mergedS = addMaps(ensureNumMap(existing.s), s);
        mergedF = addMaps(ensureNumMap(existing.f), f);
      }

      await prisma.coverageHit.upsert({
        where: { id },
        create: {
          id,
          buildHash,
          sceneKey,
          rawFilePath: filePath,
          s: mergedS,
          f: mergedF,
          b: (entry?.b || {}) as object,
          inputSourceMap: entry?.inputSourceMap ? 1 : null,
          createdAt: now,
        },
        update: { s: mergedS, f: mergedF },
      });
    } catch {
      // 继续处理其他文件
    }
  }
}

async function processQueueItem(queueId: number): Promise<void> {
  const updateResult = await prismaSqlite.coverageQueue.updateMany({
    where: { id: queueId, status: "PENDING" },
    data: { status: "PROCESSING", pid: currentPid },
  });

  if (updateResult.count === 0) return;

  try {
    const queueItem = await prismaSqlite.coverageQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueItem) return;

    const payload: CoverageQueuePayload = JSON.parse(queueItem.payload);
    const { coverage, buildHash, sceneKey } = payload;
    const coverageID = `${buildHash}|${sceneKey}`;

    const lockAcquired = await acquireLock(coverageID);
    if (!lockAcquired) {
      await prismaSqlite.coverageQueue.update({
        where: { id: queueId },
        data: { status: "PENDING" },
      });
      await sleep(1000);
      return;
    }

    try {
      await mergeCoverageData(coverage, buildHash, sceneKey);
      await prismaSqlite.coverageQueue.delete({ where: { id: queueId } });
    } finally {
      await releaseLock(coverageID);
    }
  } catch {
    await prismaSqlite.coverageQueue.update({
      where: { id: queueId },
      data: { status: "FAILED" },
    });
  }
}

async function consumptionLoop(): Promise<void> {
  let isRunning = false;

  while (true) {
    if (isRunning) {
      await sleep(1000);
      continue;
    }

    isRunning = true;
    try {
      await mergeLocalCoverageData();

      const queueItems = await prismaSqlite.coverageQueue.findMany({
        where: {
          status: "PENDING",
          OR: [{ pid: null }, { pid: currentPid }],
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      });

      const queueItem = queueItems[0];
      if (!queueItem) {
        isRunning = false;
        await sleep(10000);
        continue;
      }

      await processQueueItem(queueItem.id);
    } catch {
      await sleep(5000);
    } finally {
      isRunning = false;
    }
  }
}

/** 启动 coverage 队列消费循环，应在后端启动时调用 */
export function startCoverageConsumer(): void {
  void consumptionLoop();
}
