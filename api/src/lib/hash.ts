import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

function stableStringify(obj: unknown): string {
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

export function generateObjectSignature(object: unknown): string {
  return createHash("sha1")
    .update(stableStringify(object) || "")
    .digest("hex");
}

export function encodeObjectToCompressedBuffer(object: unknown): Buffer {
  return gzipSync(Buffer.from(JSON.stringify(object), "utf-8"));
}

export function calculateBuildHash(
  sha: string,
  provider: string,
  repoID: string,
  instrumentCwd: string,
  buildTarget?: string,
): string {
  return generateObjectSignature({
    sha,
    provider,
    repoID,
    instrumentCwd,
    buildTarget: buildTarget || "",
  });
}

export function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

export function pickCoverageField(
  coverage: Record<string, Record<string, unknown>>,
  field: string,
): string {
  for (const entry of Object.values(coverage)) {
    const value = entry?.[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}
