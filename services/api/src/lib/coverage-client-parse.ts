import { CoverageMapInitError } from "./istanbul-coverage.js";
import { normalizeTag, type CoverageTag } from "./tag.js";

export type ClientHitFile = {
  path: string;
  s: Record<string, number>;
  buildHash: string;
};

export type ParsedCoverageClient = {
  tag: CoverageTag;
  buildHash: string;
  files: ClientHitFile[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseS(path: string, value: unknown): Record<string, number> {
  if (!isPlainObject(value)) {
    throw new CoverageMapInitError(400, `缺少 s: ${path}`);
  }
  const s: Record<string, number> = {};
  for (const [key, hit] of Object.entries(value)) {
    if (typeof hit !== "number" || !Number.isFinite(hit)) {
      throw new CoverageMapInitError(400, `s[${key}] 必须是数字: ${path}`);
    }
    s[key] = hit;
  }
  return s;
}

/** 解析 POST /coverage/client 请求体 */
export function parseCoverageClientPayload(body: unknown): ParsedCoverageClient {
  if (!isPlainObject(body)) {
    throw new CoverageMapInitError(400, "请求体必须是 JSON 对象");
  }
  if (!isPlainObject(body.coverage)) {
    throw new CoverageMapInitError(400, "缺少 coverage");
  }
  if (body.tag == null) {
    throw new CoverageMapInitError(400, "缺少 tag");
  }

  const tag = normalizeTag(body.tag);
  const entries = Object.entries(body.coverage);
  if (entries.length === 0) {
    throw new CoverageMapInitError(400, "coverage 不能为空");
  }

  const files: ClientHitFile[] = entries.map(([key, value]) => {
    if (!isPlainObject(value)) {
      throw new CoverageMapInitError(400, `文件条目无效: ${key}`);
    }
    const path = typeof value.path === "string" ? value.path : key;
    if (typeof value.buildHash !== "string" || value.buildHash.length === 0) {
      throw new CoverageMapInitError(400, `缺少 buildHash: ${path}`);
    }
    return {
      path,
      s: parseS(path, value.s),
      buildHash: value.buildHash,
    };
  });

  const buildHash = files[0]!.buildHash;
  for (const file of files) {
    if (file.buildHash !== buildHash) {
      throw new CoverageMapInitError(400, "同一批 client 数据中的 buildHash 必须一致");
    }
  }

  return { tag, buildHash, files };
}
