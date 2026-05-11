import { createRoute } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Prisma } from "@prisma/client";
import { coverageQueue } from "@/api/db/coverage-queue-schema.ts";
import { prisma } from "@/api/lib/prisma.ts";
import { sqliteQueueDb } from "@/api/lib/sqlite-queue.ts";
import { ensureCommitFromScm } from "@/api/lib/commit.ts";
import { publishCoverageMapInitMessage } from "@/api/lib/coverage/coverage-map-init-producer.ts";
import { remapCoverageByOld } from "canyon-map";
import {
  generateObjectSignature,
  encodeObjectToCompressedBuffer,
  filterCoverageEntriesWithBuildHash,
  filterInvalidCoverageFiles,
} from "@/api/lib/collect/helpers.ts";
import {
  CoverageClientSchema,
  CoverageMapInitSchema,
  CoverageClientResponseSchema,
  CoverageMapInitResponseSchema,
} from "@/shared/schemas/coverage.ts";

const coverageClientRoute = createRoute({
  method: "post",
  path: "/client",
  summary: "上报覆盖率数据",
  description:
    "客户端上报覆盖率数据。需先调用 /map/init 初始化 coverage 映射。coverage 中需包含 buildHash。",
  tags: ["覆盖率"],
  request: {
    body: {
      content: {
        "application/json": { schema: CoverageClientSchema },
      },
    },
  },
  responses: {
    200: {
      description: "成功",
      content: {
        "application/json": {
          schema: CoverageClientResponseSchema,
        },
      },
    },
    400: { description: "参数错误" },
    502: { description: "未找到 coverage 记录，请先调用 map/init" },
  },
});

const coverageMapInitRoute = createRoute({
  method: "post",
  path: "/map/init",
  summary: "初始化覆盖率映射",
  description:
    "上传覆盖率 map 数据，建立 buildHash 与文件映射关系。需提供 coverage、sha、provider、repoID、instrumentCwd 等。",
  tags: ["覆盖率"],
  request: {
    body: {
      content: {
        "application/json": { schema: CoverageMapInitSchema },
      },
    },
  },
  responses: {
    200: {
      description: "成功",
      content: {
        "application/json": {
          schema: CoverageMapInitResponseSchema,
        },
      },
    },
    400: { description: "Coverage 数据为空" },
  },
});

const collectApi = new OpenAPIHono();

function firstBuildHashInCoverage(coverage: Record<string, unknown>): string | undefined {
  for (const entry of Object.values(coverage)) {
    const bh = (entry as Record<string, unknown> | undefined)?.buildHash;
    if (typeof bh === "string" && bh.length > 0) {
      return bh;
    }
  }
  return undefined;
}

collectApi.openapi(coverageClientRoute, async (c) => {
  const body = c.req.valid("json");

  const payloadHash = generateObjectSignature(body);

  const idempotentRow = await prisma.coverageClientPayloadIdempotency.findUnique({
    where: { payloadHash },
  });

  const sceneKey = generateObjectSignature(body.scene || {});
  const coverageWithBuildHash = filterCoverageEntriesWithBuildHash(body.coverage);
  if (Object.keys(coverageWithBuildHash).length === 0) {
    return c.json(
      {
        success: false,
        message: "coverage 中无带 buildHash 的有效文件条目",
      },
      400,
    );
  }

  const filterResult = filterInvalidCoverageFiles(coverageWithBuildHash);
  const coverage = filterResult.filteredCoverage as typeof body.coverage;

  if (filterResult.remainingFiles === 0) {
    return c.json(
      {
        success: false,
        message: "过滤后无有效覆盖率文件（语句 hit 均为 0 或缺少有效 s 字段）",
      },
      400,
    );
  }

  const buildHash = firstBuildHashInCoverage(coverage as Record<string, unknown>);

  if (!buildHash) {
    return c.json({ success: false, message: "coverage 中缺少 buildHash" }, 400);
  }

  const prismacoverage = await prisma.coverage.findFirst({
    where: { buildHash },
  });

  if (!prismacoverage) {
    return c.json(
      {
        success: false,
        message:
          "找不到对应的 coverage 记录，请先通过 /api/coverage/map/init 接口上传覆盖率映射数据",
      },
      502,
    );
  }

  const successPayload = {
    success: true as const,
    buildHash,
    sceneKey,
    coverageLength: Object.keys(coverage).length,
    coverageFilesTotal: filterResult.totalFiles,
    coverageFilesFiltered: filterResult.filteredFiles,
    provider: prismacoverage.provider,
    repoID: prismacoverage.repoID,
    sha: prismacoverage.sha,
    buildTarget: prismacoverage.buildTarget,
    instrumentCwd: prismacoverage.instrumentCwd,
  };

  if (idempotentRow) {
    return c.json({
      ...successPayload,
      idempotent: true,
      message: "重复负载，已忽略（幂等）",
    });
  }

  try {
    sqliteQueueDb
      .insert(coverageQueue)
      .values({
        payload: JSON.stringify({ coverage, buildHash, sceneKey }),
        status: "PENDING",
        pid: process.pid,
        createdAt: new Date().toISOString(),
      })
      .run();
  } catch {
    // 队列写入失败时仍继续后续幂等记录等逻辑
  }

  try {
    const id = `${buildHash}|${sceneKey}`;
    const scene = body.scene || {};
    const builds = Array.isArray(prismacoverage.builds) ? prismacoverage.builds : [];
    const now = new Date();

    await prisma.coverage.create({
      data: {
        id,
        buildHash: prismacoverage.buildHash,
        provider: prismacoverage.provider,
        repoID: prismacoverage.repoID,
        sha: prismacoverage.sha,
        buildTarget: prismacoverage.buildTarget,
        instrumentCwd: prismacoverage.instrumentCwd,
        sceneKey,
        scene,
        builds: builds as object,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch {
    // 常为 coverage 主键已存在（重复上报）
  }

  try {
    await prisma.coverageClientPayloadIdempotency.create({
      data: { payloadHash },
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) {
      throw e;
    }
  }

  return c.json(successPayload);
});

function calculateBuildHash(
  sha: string,
  provider: string,
  repoID: string,
  instrumentCwd: string,
  buildTarget?: string,
): string {
  return generateObjectSignature({
    sha,
    provider,
    repoID,
    instrumentCwd,
    buildTarget: buildTarget || "",
  });
}

function calculateSceneKey(scene: Record<string, unknown>): string {
  return generateObjectSignature(scene);
}

collectApi.openapi(coverageMapInitRoute, async (c) => {
  const body = c.req.valid("json");
  const coverage = body.coverage as Record<string, Record<string, unknown>>;

  let sha = body.sha;
  let provider = body.provider;
  let repoID = body.repoID;
  let instrumentCwd = body.instrumentCwd;
  let buildTarget = body.buildTarget;

  const coverageValues = Object.values(coverage);
  if (coverageValues.length === 0) {
    return c.json(
      {
        success: false,
        message: "Coverage data is empty, cannot extract parameters.",
      },
      400,
    );
  }

  const firstEntry = coverageValues[0] as Record<string, unknown>;
  if (firstEntry.sha !== undefined) sha = firstEntry.sha as string;
  if (firstEntry.provider !== undefined) provider = firstEntry.provider as string;
  if (firstEntry.repoID !== undefined) repoID = firstEntry.repoID as string;
  if (firstEntry.instrumentCwd !== undefined)
    instrumentCwd = firstEntry.instrumentCwd as string;
  if (firstEntry.buildTarget !== undefined) buildTarget = firstEntry.buildTarget as string;

  if (!sha || !provider || !repoID || !instrumentCwd) {
    return c.json(
      {
        success: false,
        message: "缺少必要参数：sha, provider, repoID, instrumentCwd",
      },
      400,
    );
  }

  const buildHash = calculateBuildHash(sha, provider, repoID, instrumentCwd, buildTarget);
  const scene = {};
  const sceneKey = calculateSceneKey(scene);
  const id = `${buildHash}|${sceneKey}`;

  const existingCoverage = await prisma.coverage.findUnique({ where: { id } });
  const now = new Date();
  const initialBuilds = body.build ? [body.build] : [];

  let coverageCreateRes;
  if (existingCoverage) {
    const existingBuilds = Array.isArray(existingCoverage.builds) ? existingCoverage.builds : [];
    const updatedBuilds = body.build ? [...existingBuilds, body.build] : existingBuilds;
    coverageCreateRes = await prisma.coverage.update({
      where: { id },
      data: { builds: updatedBuilds, updatedAt: now },
    });
  } else {
    coverageCreateRes = await prisma.coverage.create({
      data: {
        id,
        buildHash,
        provider,
        repoID,
        sha,
        buildTarget: buildTarget || "",
        instrumentCwd,
        sceneKey,
        scene,
        builds: initialBuilds,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  await ensureCommitFromScm(prisma, provider, repoID, sha);

  // remapCoverageByOld 需要每个 entry 有 path，用于 source map 还原
  const coverageForRemap = Object.fromEntries(
    Object.entries(coverage).map(([fp, e]) => [fp, { ...e, path: fp }]),
  );
  const originalCoverage = await remapCoverageByOld(coverageForRemap);

  const mapItems = Object.entries(coverage).map(([filePath, entry]) => {
    const e = entry as Record<string, unknown>;
    const chunkMap = {
      statementMap: e.statementMap,
      fnMap: e.fnMap,
      branchMap: e.branchMap,
    };
    const coverageMapHash = generateObjectSignature(chunkMap);
    const fileContentHash = (e.contentHash as string) || "";
    const originalEntry = (
      Object.values(originalCoverage) as Array<{ path?: string; oldPath?: string }>
    ).find((o) => o.oldPath === filePath);

    if (e.inputSourceMap && originalEntry) {
      const inputSourceMapCoverageMapHash = generateObjectSignature({
        ...chunkMap,
        inputSourceMap: 1,
      });
      const sourceMap = e.inputSourceMap as object;
      return {
        map: chunkMap,
        coverageMapHash: inputSourceMapCoverageMapHash,
        fileContentHash,
        fullFilePath: originalEntry.path ?? filePath,
        restoreFullFilePath: originalEntry.oldPath ?? "",
        sourceMap,
        sourceMapHash: generateObjectSignature(sourceMap),
      };
    }

    return {
      map: chunkMap,
      coverageMapHash,
      fileContentHash,
      fullFilePath: filePath,
      restoreFullFilePath: "",
      sourceMap: undefined,
      sourceMapHash: "",
    };
  });

  for (const item of mapItems) {
    const hash = `${item.coverageMapHash}|${item.fileContentHash}`;
    try {
      const compressedMap = encodeObjectToCompressedBuffer(item.map);
      await prisma.coverageMap.upsert({
        where: { hash },
        create: {
          hash,
          map: new Uint8Array(compressedMap),
          createdAt: now,
        },
        update: {},
      });
    } catch {
      // skip
    }
  }

  const relationItems = mapItems.map((item) => ({
    id: `${buildHash}|${item.fullFilePath}`,
    buildHash,
    fullFilePath: item.fullFilePath,
    restoreFullFilePath: item.restoreFullFilePath ?? "",
    coverageMapHash: item.coverageMapHash,
    sourceMapHash: item.sourceMapHash ?? "",
    fileContentHash: item.fileContentHash,
  }));

  await prisma.coverageMapRelation.createMany({
    data: relationItems,
    skipDuplicates: true,
  });

  // 有 inputSourceMap 的条目需写入 CoverageSourceMap
  const sourceMapItems = mapItems.filter((i) => i.sourceMap);
  if (sourceMapItems.length > 0) {
    await prisma.coverageSourceMap.createMany({
      data: sourceMapItems.map((item) => ({
        hash: item.sourceMapHash!,
        sourceMap: new Uint8Array(encodeObjectToCompressedBuffer(item.sourceMap!)),
      })),
      skipDuplicates: true,
    });
  }

  const hitEntities = Object.entries(coverage).map(([filePath, entry]) => {
    const e = entry as Record<string, unknown>;
    const s = (e?.s as object) || {};
    const f = (e?.f as object) || {};
    const b = (e?.b as object) || {};
    const sceneKeyHit = calculateSceneKey({});
    return {
      id: `${buildHash}|${sceneKeyHit}|${filePath}`,
      sceneKey: sceneKeyHit,
      buildHash,
      rawFilePath: filePath,
      s,
      f,
      b,
      inputSourceMap: e.inputSourceMap ? 1 : 0,
      createdAt: now,
    };
  });

  await prisma.coverageHit.createMany({
    data: hitEntities,
    skipDuplicates: true,
  });

  try {
    await publishCoverageMapInitMessage({
      id: coverageCreateRes.id,
      buildHash,
      sceneKey,
      provider,
      repoID,
      sha,
      buildTarget: buildTarget || "",
      instrumentCwd,
      coverageFileCount: Object.keys(coverage).length,
      mapItemCount: mapItems.length,
      relationItemCount: relationItems.length,
      hitEntityCount: hitEntities.length,
      sourceMapItemCount: sourceMapItems.length,
      createdAt: coverageCreateRes.createdAt.toISOString(),
      updatedAt: coverageCreateRes.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[coverage:map:init] producer failed", {
      id: coverageCreateRes.id,
      buildHash,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return c.json({
    success: true,
    message: "Coverage map initialized",
    data: coverageCreateRes,
  });
});

export default collectApi;
