import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import {
  calculateBuildHash,
  encodeObjectToCompressedBuffer,
  firstNonEmpty,
  generateObjectSignature,
  pickCoverageField,
} from "../lib/hash.ts";
import {
  addBranchHitMaps,
  addMaps,
  ensureBranchHitMap,
  ensureNumMap,
  filterCoverageEntriesWithBuildHash,
  filterInvalidCoverageFiles,
  firstBuildHashInCoverage,
} from "../lib/coverage.ts";

const CoverageDataSchema = z.record(z.string(), z.any());

const CoverageClientSchema = z.object({
  coverage: CoverageDataSchema,
  scene: z.record(z.string(), z.any()).optional(),
});

const CoverageMapInitSchema = z.object({
  sha: z.string().optional(),
  provider: z.string().optional(),
  repoID: z.string().optional(),
  instrumentCwd: z.string().optional(),
  buildTarget: z.string().optional(),
  build: z.record(z.string(), z.any()).optional(),
  coverage: CoverageDataSchema,
});

export const coverageRoutes = new Hono();

coverageRoutes.post("/client", async (c) => {
  const parsed = CoverageClientSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, message: "参数错误", issues: parsed.error.issues }, 400);
  }

  const body = parsed.data;
  const sceneKey = generateObjectSignature(body.scene || {});
  const coverageWithBuildHash = filterCoverageEntriesWithBuildHash(body.coverage);
  if (Object.keys(coverageWithBuildHash).length === 0) {
    return c.json({ success: false, message: "coverage 中无带 buildHash 的有效文件条目" }, 400);
  }

  const filterResult = filterInvalidCoverageFiles(coverageWithBuildHash);
  const coverage = filterResult.filteredCoverage as Record<string, Record<string, unknown>>;
  if (filterResult.remainingFiles === 0) {
    return c.json(
      { success: false, message: "过滤后无有效覆盖率文件（语句 hit 均为 0 或缺少有效 s 字段）" },
      400,
    );
  }

  const buildHash = firstBuildHashInCoverage(coverage);
  if (!buildHash) {
    return c.json({ success: false, message: "coverage 中缺少 buildHash" }, 400);
  }

  const coverageRecord = await prisma.coverage.findFirst({ where: { buildHash } });
  if (!coverageRecord) {
    return c.json(
      {
        success: false,
        message: "找不到对应的 coverage 记录，请先通过 /api/coverage/map/init 接口上传覆盖率映射数据",
      },
      502,
    );
  }

  const now = new Date();
  const id = `${buildHash}|${sceneKey}`;
  const scene = body.scene || {};
  const builds = Array.isArray(coverageRecord.builds) ? coverageRecord.builds : [];

  await prisma.coverage.upsert({
    where: { id },
    create: {
      id,
      buildHash: coverageRecord.buildHash,
      provider: coverageRecord.provider,
      repoID: coverageRecord.repoID,
      sha: coverageRecord.sha,
      buildTarget: coverageRecord.buildTarget,
      instrumentCwd: coverageRecord.instrumentCwd,
      sceneKey,
      scene,
      builds: builds as object,
      createdAt: now,
      updatedAt: now,
    },
    update: { updatedAt: now, scene },
  });

  for (const [filePath, entry] of Object.entries(coverage)) {
    const hitId = `${buildHash}|${sceneKey}|${filePath}`;
    const s = ensureNumMap(entry.s);
    const f = ensureNumMap(entry.f);
    const b = ensureBranchHitMap(entry.b);
    const existing = await prisma.coverageHit.findUnique({
      where: { id: hitId },
      select: { s: true, f: true, b: true },
    });

    const mergedS = existing ? addMaps(ensureNumMap(existing.s), s) : s;
    const mergedF = existing ? addMaps(ensureNumMap(existing.f), f) : f;
    const mergedB = existing ? addBranchHitMaps(ensureBranchHitMap(existing.b), b) : b;

    await prisma.coverageHit.upsert({
      where: { id: hitId },
      create: {
        id: hitId,
        buildHash,
        sceneKey,
        rawFilePath: filePath,
        s: mergedS,
        f: mergedF,
        b: mergedB as object,
        inputSourceMap: entry.inputSourceMap ? 1 : null,
        createdAt: now,
      },
      update: { s: mergedS, f: mergedF, b: mergedB as object },
    });
  }

  return c.json({
    success: true,
    buildHash,
    sceneKey,
    coverageLength: Object.keys(coverage).length,
    coverageFilesTotal: filterResult.totalFiles,
    coverageFilesFiltered: filterResult.filteredFiles,
    provider: coverageRecord.provider,
    repoID: coverageRecord.repoID,
    sha: coverageRecord.sha,
    buildTarget: coverageRecord.buildTarget,
    instrumentCwd: coverageRecord.instrumentCwd,
  });
});

coverageRoutes.post("/map/init", async (c) => {
  const parsed = CoverageMapInitSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ success: false, message: "参数错误", issues: parsed.error.issues }, 400);
  }

  const body = parsed.data;
  const coverage = body.coverage as Record<string, Record<string, unknown>>;
  const coverageValues = Object.values(coverage);
  if (coverageValues.length === 0) {
    return c.json({ success: false, message: "Coverage 数据为空，无法提取参数。" }, 400);
  }

  const sha = firstNonEmpty(pickCoverageField(coverage, "sha"), body.sha, "local");
  const provider = firstNonEmpty(pickCoverageField(coverage, "provider"), body.provider, "github");
  const repoID = firstNonEmpty(pickCoverageField(coverage, "repoID"), body.repoID, "todolist");
  const instrumentCwd = firstNonEmpty(
    pickCoverageField(coverage, "instrumentCwd"),
    body.instrumentCwd,
  );
  const buildTarget = firstNonEmpty(pickCoverageField(coverage, "buildTarget"), body.buildTarget);

  if (!instrumentCwd) {
    return c.json({ success: false, message: "缺少必要参数：instrumentCwd" }, 400);
  }

  const buildHash =
    firstNonEmpty(pickCoverageField(coverage, "buildHash")) ||
    calculateBuildHash(sha, provider, repoID, instrumentCwd, buildTarget);
  const scene = {};
  const sceneKey = generateObjectSignature(scene);
  const id = `${buildHash}|${sceneKey}`;
  const now = new Date();
  const initialBuilds = body.build ? [body.build] : [];

  const existingCoverage = await prisma.coverage.findUnique({ where: { id } });
  const coverageCreateRes = existingCoverage
    ? await prisma.coverage.update({
        where: { id },
        data: {
          builds: body.build
            ? [...(Array.isArray(existingCoverage.builds) ? existingCoverage.builds : []), body.build]
            : existingCoverage.builds,
          updatedAt: now,
        },
      })
    : await prisma.coverage.create({
        data: {
          id,
          buildHash,
          provider,
          repoID,
          sha,
          buildTarget,
          instrumentCwd,
          sceneKey,
          scene,
          builds: initialBuilds,
          createdAt: now,
          updatedAt: now,
        },
      });

  const mapItems = Object.entries(coverage).map(([filePath, entry]) => {
    const chunkMap = {
      statementMap: entry.statementMap,
      fnMap: entry.fnMap,
      branchMap: entry.branchMap,
    };
    const coverageMapHash = generateObjectSignature(chunkMap);
    const fileContentHash = typeof entry.contentHash === "string" ? entry.contentHash : "";
    const sourceMap = entry.inputSourceMap;
    const sourceMapHash = sourceMap ? generateObjectSignature(sourceMap) : "";
    return {
      map: chunkMap,
      coverageMapHash,
      fileContentHash,
      fullFilePath: filePath,
      restoreFullFilePath: "",
      sourceMap,
      sourceMapHash,
    };
  });

  for (const item of mapItems) {
    const hash = `${item.coverageMapHash}|${item.fileContentHash}`;
    await prisma.coverageMap.upsert({
      where: { hash },
      create: {
        hash,
        map: new Uint8Array(encodeObjectToCompressedBuffer(item.map)),
        createdAt: now,
      },
      update: {},
    });
  }

  for (const item of mapItems) {
    await prisma.coverageMapRelation.upsert({
      where: { id: `${buildHash}|${item.fullFilePath}` },
      create: {
        id: `${buildHash}|${item.fullFilePath}`,
        buildHash,
        fullFilePath: item.fullFilePath,
        restoreFullFilePath: item.restoreFullFilePath,
        coverageMapHash: item.coverageMapHash,
        sourceMapHash: item.sourceMapHash,
        fileContentHash: item.fileContentHash,
      },
      update: {},
    });
  }

  const sourceMapItems = mapItems.filter((item) => item.sourceMap);
  for (const item of sourceMapItems) {
    await prisma.coverageSourceMap.upsert({
      where: { hash: item.sourceMapHash },
      create: {
        hash: item.sourceMapHash,
        sourceMap: new Uint8Array(encodeObjectToCompressedBuffer(item.sourceMap)),
      },
      update: {},
    });
  }

  for (const [filePath, entry] of Object.entries(coverage)) {
    const hitId = `${buildHash}|${sceneKey}|${filePath}`;
    await prisma.coverageHit.upsert({
      where: { id: hitId },
      create: {
        id: hitId,
        sceneKey,
        buildHash,
        rawFilePath: filePath,
        s: (entry.s as object) || {},
        f: (entry.f as object) || {},
        b: (entry.b as object) || {},
        inputSourceMap: entry.inputSourceMap ? 1 : 0,
        createdAt: now,
      },
      update: {},
    });
  }

  return c.json({
    success: true,
    message: "Coverage map initialized",
    data: coverageCreateRes,
  });
});
