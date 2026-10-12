import { createHash } from "node:crypto";

import { stableStringify } from "./stable-hash.js";

/** 场景标签四元组 */
export type CoverageTag = {
  source: string;
  type: string;
  env: string;
  trigger: string;
};

/** 规范化 tag：固定四键，缺省为空串 */
export function normalizeTag(input: unknown): CoverageTag {
  const obj = isPlainObject(input) ? input : {};
  return {
    source: typeof obj.source === "string" ? obj.source : "",
    type: typeof obj.type === "string" ? obj.type : "",
    env: typeof obj.env === "string" ? obj.env : "",
    trigger: typeof obj.trigger === "string" ? obj.trigger : "",
  };
}

/** tagKey = sha256(stableStringify(规范化 tag)) */
export function tagKey(tag: CoverageTag): string {
  return createHash("sha256").update(stableStringify(tag), "utf8").digest("hex");
}

/** 快照筛选：只保留传入的非空字段，用于 jsonb @> */
export function normalizeTagFilter(input: unknown): Partial<CoverageTag> | null {
  if (input == null) {
    return null;
  }
  if (!isPlainObject(input)) {
    return null;
  }
  const filter: Partial<CoverageTag> = {};
  for (const key of ["source", "type", "env", "trigger"] as const) {
    if (typeof input[key] === "string") {
      filter[key] = input[key];
    }
  }
  return Object.keys(filter).length > 0 ? filter : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
