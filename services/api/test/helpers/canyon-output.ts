import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type CanyonFileEntry = {
  buildHash: string;
  path: string;
  sha?: string;
  s?: Record<string, number>;
  statementMap?: Record<string, unknown>;
  inputSourceMap?: unknown;
  [key: string]: unknown;
};

const canyonOutputDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../packages/real-app/.canyon_output",
);

/** 读取 .canyon_output 下全部 JSON，合并为单次 init 请求体 */
export async function loadMergedCanyonOutput(): Promise<{
  raw: string;
  payload: Record<string, CanyonFileEntry>;
  sourceFileCount: number;
  buildHash: string;
}> {
  const entries = await readdir(canyonOutputDir);
  const jsonFiles = entries.filter((name) => name.endsWith(".json")).sort();
  if (jsonFiles.length === 0) {
    throw new Error(`未找到覆盖率文件: ${canyonOutputDir}`);
  }

  const payload: Record<string, CanyonFileEntry> = {};
  for (const name of jsonFiles) {
    const filePath = path.join(canyonOutputDir, name);
    const part = JSON.parse(await readFile(filePath, "utf8")) as Record<string, CanyonFileEntry>;
    Object.assign(payload, part);
  }

  const first = Object.values(payload)[0];
  if (!first?.buildHash) {
    throw new Error("canyon_output 缺少 buildHash");
  }

  return {
    raw: JSON.stringify(payload),
    payload,
    sourceFileCount: jsonFiles.length,
    buildHash: first.buildHash,
  };
}

/** 从 init 数据抽出 client 上报用的 coverage（只保留 path / s / buildHash） */
export function toClientCoverage(
  payload: Record<string, CanyonFileEntry>,
  hitForKey: (statementKey: string, filePath: string) => number,
): Record<string, { path: string; s: Record<string, number>; buildHash: string }> {
  const coverage: Record<string, { path: string; s: Record<string, number>; buildHash: string }> =
    {};

  for (const [filePath, entry] of Object.entries(payload)) {
    const keys = Object.keys(entry.s ?? entry.statementMap ?? {});
    const s: Record<string, number> = {};
    for (const key of keys) {
      s[key] = hitForKey(key, filePath);
    }
    coverage[filePath] = {
      path: entry.path ?? filePath,
      s,
      buildHash: entry.buildHash,
    };
  }

  return coverage;
}

/** 改写 payload 内全部 buildHash（便于每次 e2e 留下独立数据、互不踩踏） */
export function withBuildHash(
  payload: Record<string, CanyonFileEntry>,
  buildHash: string,
): Record<string, CanyonFileEntry> {
  const next: Record<string, CanyonFileEntry> = {};
  for (const [filePath, entry] of Object.entries(payload)) {
    next[filePath] = { ...entry, buildHash };
  }
  return next;
}

/** 生成本次运行唯一的 buildHash */
export function uniqueBuildHash(prefix = "e2e"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
