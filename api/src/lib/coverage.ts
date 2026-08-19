export type NumMap = Record<string, number>;
export type BranchHitMap = Record<string, number[]>;

export function filterInvalidCoverageFiles(coverage: unknown): {
  filteredCoverage: Record<string, unknown>;
  totalFiles: number;
  filteredFiles: number;
  remainingFiles: number;
} {
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    return { filteredCoverage: {}, totalFiles: 0, filteredFiles: 0, remainingFiles: 0 };
  }

  const filteredCoverage: Record<string, unknown> = {};
  let totalFiles = 0;
  let filteredFiles = 0;

  for (const [filePath, fileCoverage] of Object.entries(coverage as Record<string, unknown>)) {
    totalFiles += 1;
    const cov = fileCoverage as Record<string, unknown> | null;
    if (
      cov &&
      typeof cov === "object" &&
      cov.s &&
      typeof cov.s === "object" &&
      !Array.isArray(cov.s)
    ) {
      const sValues = Object.values(cov.s as Record<string, unknown>);
      if (sValues.length === 0 || sValues.every((value) => !value)) {
        filteredFiles += 1;
        continue;
      }
    } else {
      filteredFiles += 1;
      continue;
    }
    filteredCoverage[filePath] = cov;
  }

  return {
    filteredCoverage,
    totalFiles,
    filteredFiles,
    remainingFiles: totalFiles - filteredFiles,
  };
}

export function filterCoverageEntriesWithBuildHash(coverage: unknown): Record<string, unknown> {
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(coverage as Record<string, unknown>).filter(
      ([, item]) =>
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        Object.prototype.hasOwnProperty.call(item, "buildHash"),
    ),
  );
}

export function firstBuildHashInCoverage(coverage: Record<string, unknown>): string | undefined {
  for (const entry of Object.values(coverage)) {
    const bh = (entry as Record<string, unknown> | undefined)?.buildHash;
    if (typeof bh === "string" && bh.length > 0) {
      return bh;
    }
  }
  return undefined;
}

export function ensureNumMap(value: unknown): NumMap {
  if (!value || typeof value !== "object") return {};
  const src = value as Record<string, unknown>;
  const out: NumMap = {};
  for (const k of Object.keys(src)) {
    const n = typeof src[k] === "number" ? src[k] : Number(src[k]);
    if (!Number.isNaN(n)) out[k] = (out[k] || 0) + n;
  }
  return out;
}

export function addMaps(a: NumMap, b: NumMap): NumMap {
  const res: NumMap = { ...a };
  for (const k of Object.keys(b)) {
    res[k] = (res[k] || 0) + b[k];
  }
  return res;
}

export function ensureBranchHitMap(value: unknown): BranchHitMap {
  if (!value || typeof value !== "object") return {};
  const src = value as Record<string, unknown>;
  const out: BranchHitMap = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (!Array.isArray(v)) continue;
    out[k] = v.map((item) => {
      const n = typeof item === "number" ? item : Number(item);
      return Number.isNaN(n) ? 0 : n;
    });
  }
  return out;
}

export function addBranchHitMaps(a: BranchHitMap, b: BranchHitMap): BranchHitMap {
  const res: BranchHitMap = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const arrA = a[key] || [];
    const arrB = b[key] || [];
    const maxLen = Math.max(arrA.length, arrB.length);
    const merged = new Array<number>(maxLen);
    for (let i = 0; i < maxLen; i += 1) {
      merged[i] = (arrA[i] || 0) + (arrB[i] || 0);
    }
    res[key] = merged;
  }
  return res;
}
