import { prisma } from "@/api/lib/prisma.ts";
import { decodeCompressedObject } from "@/api/lib/collect/helpers.ts";
import { addMaps, ensureNumMap, type NumMap } from "@/api/lib/collect/coverage-merge.util.ts";
import { testExclude } from "@/api/lib/coverage/test-exclude.ts";
import { remapCoverageByOld } from "canyon-map";

export interface CoverageMapForCommitParams {
  provider: string;
  repoID: string;
  sha: string;
  buildTarget?: string;
  filePath?: string;
  scene?: string;
}

/**
 * 将 key-value 格式的 scene 对象转换为 Prisma JSON 查询条件
 */
function buildSceneQueryCondition(scene?: string) {
  if (!scene) return undefined;
  try {
    const sceneObj = JSON.parse(scene);
    if (typeof sceneObj !== "object" || sceneObj === null || Array.isArray(sceneObj)) {
      return undefined;
    }
    const entries = Object.entries(sceneObj);
    if (entries.length === 0) return undefined;
    if (entries.length === 1) {
      const [key, value] = entries[0];
      return { path: [key], equals: String(value) };
    }
    return {
      AND: entries.map(([key, value]) => ({
        path: [key],
        equals: String(value),
      })),
    };
  } catch {
    return undefined;
  }
}

/**
 * 按 commit 查询覆盖率 map（subject=commit）
 */
export async function getCoverageMapForCommit(
  params: CoverageMapForCommitParams,
): Promise<Record<string, unknown> | { success: false; message: string }> {
  const { provider, repoID, sha, buildTarget = "", filePath, scene } = params;

  const coverageWhereCondition: Record<string, unknown> = {
    provider,
    repoID,
    sha,
    buildTarget,
  };
  const sceneCondition = buildSceneQueryCondition(scene);
  if (sceneCondition) {
    (coverageWhereCondition as Record<string, unknown>).scene = sceneCondition;
  }

  const coverageRecords = await prisma.coverage.findMany({
    where: coverageWhereCondition as never,
  });
  if (coverageRecords.length === 0) {
    return {
      success: false,
      message: "No coverage records found for the specified commit.",
    };
  }

  const sceneKeys = new Set<string>();
  for (const record of coverageRecords) {
    sceneKeys.add(record.sceneKey);
  }

  const coverageRecord = coverageRecords[0];
  const { instrumentCwd, buildHash } = coverageRecord;
  const instrumentCwdPrefix = instrumentCwd + "/";

  const mapRelationWhereCondition: { buildHash: string; fullFilePath?: string } = { buildHash };
  if (filePath) {
    mapRelationWhereCondition.fullFilePath = instrumentCwdPrefix + filePath;
  }

  const mapRelations = await prisma.coverageMapRelation.findMany({
    where: mapRelationWhereCondition,
  });
  if (mapRelations.length === 0) {
    return {
      success: false,
      message: "No coverage map relations found for the specified criteria.",
    };
  }

  const sourceMapHashSet = new Set<string>();
  const coverageMapHashKeySet = new Set<string>();
  for (const relation of mapRelations) {
    sourceMapHashSet.add(relation.sourceMapHash);
    coverageMapHashKeySet.add(`${relation.coverageMapHash}|${relation.fileContentHash}`);
  }

  const [sourceMaps, coverageMaps] = await Promise.all([
    prisma.coverageSourceMap.findMany({
      where: { hash: { in: Array.from(sourceMapHashSet) } },
    }),
    prisma.coverageMap.findMany({
      where: { hash: { in: Array.from(coverageMapHashKeySet) } },
    }),
  ]);

  const sourceMapIndex = new Map<string, (typeof sourceMaps)[0]>();
  for (const sm of sourceMaps) sourceMapIndex.set(sm.hash, sm);
  const coverageMapIndex = new Map<string, (typeof coverageMaps)[0]>();
  for (const cm of coverageMaps) coverageMapIndex.set(cm.hash, cm);

  const fileCoverageMap = new Map<string, Record<string, unknown>>();
  for (const relation of mapRelations) {
    const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
    const sourceMapRecord = sourceMapIndex.get(relation.sourceMapHash);
    const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
    const coverageMapRecord = coverageMapIndex.get(coverageMapKey);
    if (!coverageMapRecord) continue;

    const decoded = decodeCompressedObject(coverageMapRecord.map);
    if (!decoded || typeof decoded !== "object") continue;

    fileCoverageMap.set(rawFilePath, {
      path: rawFilePath,
      ...(decoded as Record<string, unknown>),
      inputSourceMap: sourceMapRecord
        ? decodeCompressedObject(sourceMapRecord.sourceMap)
        : undefined,
    });
  }
  if (fileCoverageMap.size === 0) {
    return {
      success: false,
      message: "No valid coverage maps found after processing relations.",
    };
  }

  const coverageHitWhereCondition: Record<string, unknown> = { buildHash };
  if (sceneKeys.size > 0) {
    coverageHitWhereCondition.sceneKey = { in: Array.from(sceneKeys) };
  }
  const coverageHits = await prisma.coverageHit.findMany({
    where: coverageHitWhereCondition as never,
  });

  const aggregatedHitDataByFile = new Map<string, { s: NumMap; f: NumMap }>();
  for (const hit of coverageHits) {
    if (!aggregatedHitDataByFile.has(hit.rawFilePath)) {
      aggregatedHitDataByFile.set(hit.rawFilePath, { s: {}, f: {} });
    }
    const fileHitData = aggregatedHitDataByFile.get(hit.rawFilePath)!;
    fileHitData.s = addMaps(fileHitData.s, ensureNumMap(hit.s as Record<string, unknown>));
    fileHitData.f = addMaps(fileHitData.f, ensureNumMap(hit.f as Record<string, unknown>));
  }

  const mergedCoverageData: Record<string, Record<string, unknown>> = {};
  for (const [rawFilePath, fileCoverageMapData] of fileCoverageMap.entries()) {
    const fileHitData = aggregatedHitDataByFile.get(rawFilePath);
    if (fileHitData) {
      mergedCoverageData[rawFilePath] = {
        ...fileCoverageMapData,
        s: fileHitData.s,
        f: fileHitData.f,
        b: {},
        branchMap: {},
      };
    }
  }
  if (Object.keys(mergedCoverageData).length === 0) {
    return {
      success: false,
      message: "No coverage data could be merged after combining maps and hits.",
    };
  }

  const remappedCoverage = await remapCoverageByOld(mergedCoverageData);
  if (!remappedCoverage || typeof remappedCoverage !== "object") {
    return {
      success: false,
      message: "Failed to remap coverage.",
    };
  }

  const normalizedCoverage: Record<string, Record<string, unknown>> = {};
  for (const [fp, fileCoverage] of Object.entries(
    remappedCoverage as Record<string, Record<string, unknown> & { path?: string }>,
  )) {
    const normalizedPath = fp.startsWith(instrumentCwdPrefix)
      ? fp.slice(instrumentCwdPrefix.length)
      : fp;
    normalizedCoverage[normalizedPath] = {
      ...fileCoverage,
      path: normalizedPath,
    };
  }

  return testExclude(normalizedCoverage, JSON.stringify({ exclude: ["dist/**"] })) as Record<
    string,
    unknown
  >;
}
