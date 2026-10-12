import type { AssembleFileInput, InstrumentFileCoverage } from "./types.js";

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

function asStatementMap(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

/**
 * 把 hit(s) + map(statementMap) + inputSourceMap 组装成 istanbul 仪器侧 coverage。
 * 暂无 fn/branch 时用空对象占位，便于 source map 回溯。
 */
export function assembleInstrumentCoverage(
  files: AssembleFileInput[],
): Record<string, InstrumentFileCoverage> {
  const coverage: Record<string, InstrumentFileCoverage> = {};

  for (const file of files) {
    const entry: InstrumentFileCoverage = {
      path: file.path,
      statementMap: asStatementMap(file.statementMap),
      // istanbul 要求具备 fnMap/branchMap；当前库未存则占位空对象
      fnMap: {},
      branchMap: {},
      s: asStatementHits(file.s),
      f: {},
      b: {},
      buildHash: file.buildHash,
    };
    if (file.inputSourceMap != null) {
      entry.inputSourceMap = file.inputSourceMap;
    }
    coverage[file.path] = entry;
  }

  return coverage;
}
