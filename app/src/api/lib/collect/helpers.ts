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

/**
 * 过滤 coverage 数据，移除 s 字段所有项都是 0 的文件（未执行的覆盖率）
 */
export function filterInvalidCoverageFiles(coverage: unknown): {
  filteredCoverage: Record<string, unknown>;
  totalFiles: number;
  filteredFiles: number;
  remainingFiles: number;
} {
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    return {
      filteredCoverage: {},
      totalFiles: 0,
      filteredFiles: 0,
      remainingFiles: 0,
    };
  }

  const filteredCoverage: Record<string, unknown> = {};
  let totalFiles = 0;
  let filteredFiles = 0;

  for (const [filePath, fileCoverage] of Object.entries(coverage as Record<string, unknown>)) {
    totalFiles++;
    const cov = fileCoverage as Record<string, unknown> | null;

    if (
      cov &&
      typeof cov === "object" &&
      cov.s &&
      typeof cov.s === "object" &&
      !Array.isArray(cov.s)
    ) {
      const sValues = Object.values(cov.s as Record<string, unknown>);
      if (sValues.length > 0) {
        const allZeros = sValues.every(
          (value) => value === 0 || value === null || value === undefined,
        );
        if (allZeros) {
          filteredFiles++;
          continue;
        }
      } else {
        filteredFiles++;
        continue;
      }
    } else if (
      cov &&
      typeof cov === "object" &&
      (!cov.s || typeof cov.s !== "object" || Array.isArray(cov.s))
    ) {
      filteredFiles++;
      continue;
    }

    filteredCoverage[filePath] = cov as unknown;
  }

  return {
    filteredCoverage,
    totalFiles,
    filteredFiles,
    remainingFiles: totalFiles - filteredFiles,
  };
}

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
