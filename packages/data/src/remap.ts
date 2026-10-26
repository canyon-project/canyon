import { createCoverageMap } from "@vitest/istanbul-lib-coverage";
import { createSourceMapStore } from "@vitest/istanbul-lib-source-maps";

import type { InstrumentFileCoverage, SnapshotFileCoverage } from "./types.js";

function asStatementHits(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const out: Record<string, number> = {};
  for (const [key, hit] of Object.entries(value as Record<string, unknown>)) {
    out[key] = typeof hit === "number" && Number.isFinite(hit) ? hit : 0;
  }
  return out;
}

function asObjectMap(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

type TransformedFileCoverage = {
  path?: string;
  statementMap?: unknown;
  fnMap?: unknown;
  branchMap?: unknown;
  s?: unknown;
  f?: unknown;
  b?: unknown;
};

/**
 * 用 istanbul-lib-source-maps 把仪器覆盖率回溯到源码，保留 Istanbul 单文件结构（含 statementMap）。
 * 注意：createCoverageMap / transform 过程会使用输入对象的拷贝语义，勿依赖原地 mutate。
 */
export async function remapToSourceSnapshot(
  instrumentCoverage: Record<string, InstrumentFileCoverage>,
  buildHash: string,
): Promise<Record<string, SnapshotFileCoverage>> {
  if (Object.keys(instrumentCoverage).length === 0) {
    return {};
  }

  // istanbul 的 CoverageMapData 与我们的仪器结构兼容，此处做一次断言
  const coverageMap = createCoverageMap(
    instrumentCoverage as Parameters<typeof createCoverageMap>[0],
  );
  const mapStore = createSourceMapStore();
  const transformed = await mapStore.transformCoverage(coverageMap);
  const json = transformed.toJSON() as Record<string, TransformedFileCoverage>;

  const snapshot: Record<string, SnapshotFileCoverage> = {};
  for (const [filePath, file] of Object.entries(json)) {
    const path = typeof file.path === "string" && file.path.length > 0 ? file.path : filePath;
    snapshot[path] = {
      path,
      statementMap: asObjectMap(file.statementMap),
      fnMap: asObjectMap(file.fnMap),
      branchMap: asObjectMap(file.branchMap),
      s: asStatementHits(file.s),
      f: asStatementHits(file.f),
      b: asObjectMap(file.b),
      buildHash,
    };
  }
  return snapshot;
}
