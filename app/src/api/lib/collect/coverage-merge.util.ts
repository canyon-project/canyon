export type NumMap = Record<string, number>;

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
