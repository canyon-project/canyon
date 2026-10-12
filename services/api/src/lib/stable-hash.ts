import { createHash } from "node:crypto";

/** 稳定序列化对象（键排序）用于生成确定性 hash */
export function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(
    (k) => JSON.stringify(k) + ":" + stableStringify((obj as Record<string, unknown>)[k]),
  );
  return "{" + pairs.join(",") + "}";
}

/** inputSourceMap 内容 hash（sha256） */
export function inputSourceMapHash(inputSourceMap: unknown): string {
  return createHash("sha256").update(stableStringify(inputSourceMap), "utf8").digest("hex");
}
