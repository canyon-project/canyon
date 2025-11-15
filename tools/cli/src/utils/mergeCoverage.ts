export type StatementCounts = Record<string, number>;
export type FunctionCounts = Record<string, number>;
export type BranchCounts = Record<string, number[]>;

export interface FileCoverageCounters {
  s?: StatementCounts;
  f?: FunctionCounts;
  b?: BranchCounts;
  path?: string;
  // keep the rest meta fields as loose typing
  [key: string]: any;
}

export type CoverageMap = Record<string, FileCoverageCounters>;

function mergeNumberMaps(
  a: StatementCounts = {},
  b: StatementCounts = {},
): StatementCounts {
  const result: StatementCounts = { ...a };
  for (const key of Object.keys(b)) {
    const aVal = result[key] ?? 0;
    const bVal = b[key] ?? 0;
    result[key] = aVal + bVal;
  }
  return result;
}

function mergeBranchArrays(aArr: number[] = [], bArr: number[] = []): number[] {
  const maxLen = Math.max(aArr.length, bArr.length);
  const out: number[] = new Array(maxLen);
  for (let i = 0; i < maxLen; i++) {
    const aVal = aArr[i] ?? 0;
    const bVal = bArr[i] ?? 0;
    out[i] = aVal + bVal;
  }
  return out;
}

function mergeBranchMaps(
  a: BranchCounts = {},
  b: BranchCounts = {},
): BranchCounts {
  const result: BranchCounts = { ...a };
  for (const key of Object.keys(b)) {
    const aArr = result[key] ?? [];
    const bArr = b[key] ?? [];
    result[key] = mergeBranchArrays(aArr, bArr);
  }
  return result;
}

export function mergeFileCoverage(
  a: FileCoverageCounters,
  b: FileCoverageCounters,
): FileCoverageCounters {
  // Assume paths are identical; keep metadata from the first by default
  return {
    ...a,
    // keep latest path if provided
    path: b.path ?? a.path,
    s: mergeNumberMaps(a.s, b.s),
    f: mergeNumberMaps(a.f, b.f),
    b: mergeBranchMaps(a.b, b.b),
  };
}

export function mergeCoverageMaps(
  target: CoverageMap = {},
  source: CoverageMap = {},
): CoverageMap {
  const out: CoverageMap = { ...target };
  for (const filePath of Object.keys(source)) {
    const existing = out[filePath];
    const incoming = source[filePath];
    if (!existing) {
      out[filePath] = incoming;
    } else {
      out[filePath] = mergeFileCoverage(existing, incoming);
    }
  }
  return out;
}
