/**
 * Istanbul 覆盖率核心数据结构
 * 对齐 istanbul-oxide / istanbul-lib-coverage
 * @see https://github.com/kwonoj/swc-plugin-coverage-instrument/tree/main/packages/istanbul-oxide/src
 */

/** 源码位置（行 / 列，1-based line，0-based column，与 Istanbul 一致） */
export interface Location {
  line: number;
  column: number;
}

/** 源码区间 */
export interface Range {
  start: Location;
  end: Location;
}

/** 函数元数据（对应 fnMap 的值） */
export interface FunctionMapping {
  name: string;
  /** 函数声明位置 */
  decl: Range;
  /** 函数体位置 */
  loc: Range;
  line: number;
}

/**
 * 分支类型（istanbul-oxide BranchType，序列化为 kebab-case）
 * Istanbul 实际还可能出现其它字符串，因此 BranchMapping.type 仍用 string 兼容。
 */
export type BranchType =
  | 'binary-expr'
  | 'default-arg'
  | 'if'
  | 'switch'
  | 'cond-expr'
  | (string & {});

/** 分支元数据（对应 branchMap 的值） */
export interface BranchMapping {
  loc?: Range | null;
  type: BranchType;
  locations: Range[];
  line?: number | null;
}

/**
 * 索引键：Istanbul JSON 中为字符串数字键（"0","1",...）
 * 运行时也常按 string 读写。
 */
export type CoverageIndex = string;

/** statementMap：statement index → 位置 */
export type StatementMap = Record<CoverageIndex, Range>;

/** fnMap：function index → 函数元数据 */
export type FunctionMap = Record<CoverageIndex, FunctionMapping>;

/** branchMap：branch index → 分支元数据 */
export type BranchMap = Record<CoverageIndex, BranchMapping>;

/** 语句 / 函数命中次数：index → hit count */
export type HitMap = Record<CoverageIndex, number>;

/** 分支命中次数：index → 各 path 的 hit count */
export type BranchHitMap = Record<CoverageIndex, number[]>;

/** 行号 → 命中次数（由 statement 推导） */
export type LineHitMap = Record<number, number>;

/** 单行分支覆盖统计（getBranchCoverageByLine 的值） */
export interface BranchLineCoverage {
  covered: number;
  total: number;
  coverage: number;
}

export type BranchCoverageByLine = Record<number, BranchLineCoverage>;

/**
 * 单文件覆盖率静态 Map（编译期可知，可与 Hit 分离存储）
 */
export interface FileCoverageMapData {
  path: string;
  statementMap: StatementMap;
  fnMap: FunctionMap;
  branchMap: BranchMap;
  /** Source Map v3，可选 */
  inputSourceMap?: InputSourceMap | null;
}

/**
 * 单文件覆盖率动态 Hit（运行时累加）
 */
export interface FileCoverageHitData {
  /** 语句命中 */
  s: HitMap;
  /** 函数命中 */
  f: HitMap;
  /** 分支命中 */
  b: BranchHitMap;
  /** 分支真值命中（reportLogic 时存在，结构同 b） */
  bT?: BranchHitMap;
}

/**
 * 完整单文件覆盖率（Map + Hit）
 * 对应 istanbul-oxide FileCoverage / istanbul-lib-coverage FileCoverageData
 */
export interface FileCoverageData extends FileCoverageMapData, FileCoverageHitData {
  /** 是否为「全量空壳」覆盖率对象 */
  all?: boolean;
}

/**
 * 多文件覆盖率表：file path → FileCoverageData
 * 对应 istanbul-oxide CoverageMap / istanbul-lib-coverage CoverageMapData
 */
export type CoverageMapData = Record<string, FileCoverageData>;

/** 单项覆盖率汇总数字 */
export interface CoverageTotals {
  total: number;
  covered: number;
  skipped: number;
  /** 百分比；无法计算时可为 null */
  pct: number | null;
}

/**
 * 覆盖率汇总
 * 对应 istanbul-oxide CoverageSummary
 */
export interface CoverageSummaryData {
  lines: CoverageTotals;
  statements: CoverageTotals;
  functions: CoverageTotals;
  branches: CoverageTotals;
  branchesTrue?: CoverageTotals;
}

/**
 * Source Map v3
 * 对应 istanbul-oxide SourceMap
 */
export interface InputSourceMap {
  version: number;
  file?: string | null;
  sourceRoot?: string | null;
  sources: string[];
  sourcesContent?: Array<string | null> | null;
  names: string[];
  mappings: string;
}

// ---------------------------------------------------------------------------
// Canyon 扩展：Hit / Map 分离与构建关联
// ---------------------------------------------------------------------------

/**
 * Canyon 在运行时产物中保留的轻量覆盖率（剥离 Map 后）
 * 与 CoverageHit 表字段对齐
 */
export interface CanyonFileCoverageHit extends FileCoverageHitData {
  path?: string;
  buildHash: string;
  /** 是否仍携带 inputSourceMap 标志等扩展字段时使用 */
  inputSourceMap?: 0 | 1 | boolean | null;
}

/**
 * Canyon 初始 Map 产物（CI 写入 .canyon_output）
 * 含完整 Map + 构建身份字段
 */
export interface CanyonFileCoverageMap extends FileCoverageMapData {
  buildHash: string;
  provider?: string;
  repoID?: string;
  sha?: string;
  buildTarget?: string;
  instrumentCwd?: string;
  contentHash?: string;
  /** 插桩 schema 等 Istanbul 扩展字段 */
  _coverageSchema?: string;
  hash?: string;
}

/** 按 path 索引的初始 Map 上报体 */
export type CanyonCoverageMapInitPayload = Record<string, CanyonFileCoverageMap>;

/** 按 path 索引的运行时 Hit 上报体 */
export type CanyonCoverageHitPayload = Record<string, CanyonFileCoverageHit>;
