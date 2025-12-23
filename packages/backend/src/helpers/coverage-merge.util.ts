/**
 * 数字映射类型，用于覆盖率数据
 */
export type NumMap = Record<string, number>;

/**
 * 将未知类型转换为 NumMap
 * 支持 number 或可转换为 number 的字符串
 */
export function ensureNumMap(value: unknown): NumMap {
  if (!value || typeof value !== 'object') return {};
  const src = value as Record<string, unknown>;
  const out: NumMap = {};
  for (const k of Object.keys(src)) {
    const v = src[k] as any;
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isNaN(n)) out[k] = (out[k] || 0) + n;
  }
  return out;
}

/**
 * 合并两个 NumMap，累加相同 key 的值
 */
export function addMaps(a: NumMap, b: NumMap): NumMap {
  const res: NumMap = { ...a };
  for (const k of Object.keys(b)) {
    res[k] = (res[k] || 0) + b[k];
  }
  return res;
}
