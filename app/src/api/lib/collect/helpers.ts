import { createHash } from "node:crypto";
import * as zlib from "node:zlib";

/** 稳定序列化对象（键排序）用于生成确定性 hash */
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

export const generateObjectSignature = (object: unknown): string =>
  createHash("sha1")
    .update(stableStringify(object) || "")
    .digest("hex");

export function encodeObjectToCompressedBuffer(object: unknown): Buffer {
  const jsonString = JSON.stringify(object);
  const buffer = Buffer.from(jsonString, "utf-8");
  return zlib.gzipSync(buffer);
}

export function decodeCompressedObject(compressedBuffer: Buffer | Uint8Array): unknown {
  try {
    const decompressedBuffer = zlib.gunzipSync(
      Buffer.isBuffer(compressedBuffer) ? compressedBuffer : Buffer.from(compressedBuffer),
    );
    return JSON.parse(decompressedBuffer.toString("utf-8"));
  } catch (error) {
    console.error("解码过程中出现错误:", error);
    return null;
  }
}
