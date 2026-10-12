/** istanbul / babel-plugin-istanbul 单文件覆盖率条目（init 阶段用到的字段） */
export interface IstanbulFileCoverage {
  path: string;
  statementMap: Record<string, unknown>;
  inputSourceMap?: unknown;
  buildHash: string;
  provider?: string;
  repoID?: string;
  sha?: string;
  buildTarget?: string;
  instrumentCwd?: string;
}

/** POST /coverage/map/init 请求体：路径 -> 文件覆盖率 */
export type IstanbulCoveragePayload = Record<string, IstanbulFileCoverage>;

export class CoverageMapInitError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFileEntry(key: string, value: unknown): IstanbulFileCoverage {
  if (!isPlainObject(value)) {
    throw new CoverageMapInitError(400, `文件条目无效: ${key}`);
  }
  const path = typeof value.path === "string" ? value.path : key;
  if (!isPlainObject(value.statementMap)) {
    throw new CoverageMapInitError(400, `缺少 statementMap: ${path}`);
  }
  if (typeof value.buildHash !== "string" || value.buildHash.length === 0) {
    throw new CoverageMapInitError(400, `缺少 buildHash: ${path}`);
  }
  return {
    path,
    statementMap: value.statementMap,
    inputSourceMap: value.inputSourceMap,
    buildHash: value.buildHash,
    provider: typeof value.provider === "string" ? value.provider : "",
    repoID: typeof value.repoID === "string" ? value.repoID : "",
    sha: typeof value.sha === "string" ? value.sha : "",
    buildTarget: typeof value.buildTarget === "string" ? value.buildTarget : "",
    instrumentCwd: typeof value.instrumentCwd === "string" ? value.instrumentCwd : "",
  };
}

export function parseIstanbulCoveragePayload(body: unknown): {
  buildHash: string;
  meta: Omit<IstanbulFileCoverage, "path" | "statementMap" | "inputSourceMap">;
  files: IstanbulFileCoverage[];
} {
  if (!isPlainObject(body)) {
    throw new CoverageMapInitError(400, "请求体必须是 JSON 对象");
  }

  const entries = Object.entries(body);
  if (entries.length === 0) {
    throw new CoverageMapInitError(400, "覆盖率数据不能为空");
  }

  const files = entries.map(([key, value]) => parseFileEntry(key, value));
  const buildHash = files[0]!.buildHash;
  const meta = {
    buildHash,
    provider: files[0]!.provider ?? "",
    repoID: files[0]!.repoID ?? "",
    sha: files[0]!.sha ?? "",
    buildTarget: files[0]!.buildTarget ?? "",
    instrumentCwd: files[0]!.instrumentCwd ?? "",
  };

  for (const file of files) {
    if (file.buildHash !== buildHash) {
      throw new CoverageMapInitError(400, "同一批 init 数据中的 buildHash 必须一致");
    }
  }

  return { buildHash, meta, files };
}
