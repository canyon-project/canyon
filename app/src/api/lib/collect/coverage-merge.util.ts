export type NumMap = Record<string, number>;
export type BranchHitMap = Record<string, number[]>;

export function ensureNumMap(value: unknown): NumMap {
  if (!value || typeof value !== "object") return {};
  const src = value as Record<string, unknown>;
  const out: NumMap = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    const n = typeof v === "number" ? v : Number(v);
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
    const arr: number[] = [];
    for (const item of v) {
      const n = typeof item === "number" ? item : Number(item);
      arr.push(Number.isNaN(n) ? 0 : n);
    }
    out[k] = arr;
  }

  return out;
}

export function addBranchHitMaps(a: BranchHitMap, b: BranchHitMap): BranchHitMap {
  const res: BranchHitMap = {};
  const keys = new Set<string>([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {
    const arrA = a[key] || [];
    const arrB = b[key] || [];
    const maxLen = Math.max(arrA.length, arrB.length);
    const merged = new Array<number>(maxLen);
    for (let i = 0; i < maxLen; i++) {
      merged[i] = (arrA[i] || 0) + (arrB[i] || 0);
    }
    res[key] = merged;
  }

  return res;
}
