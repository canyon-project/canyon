/** 将多份 istanbul `s` 按 key 相加合并 */
export function mergeStatementHits(
  ...maps: Array<Record<string, number> | unknown>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const map of maps) {
    if (!map || typeof map !== "object" || Array.isArray(map)) {
      continue;
    }
    for (const [key, value] of Object.entries(map as Record<string, unknown>)) {
      const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
      out[key] = (out[key] ?? 0) + n;
    }
  }
  return out;
}
