import { BranchMapping, FunctionMapping, Range } from 'istanbul-lib-coverage';

// 核心，
// 0. 必须得先上报，不在__coverage__对象里加
// 1. babel插件，
// 2. @canyonjs/cli upload
// 3. canyon-crn里
// 4. gitlab ci里

type StatementId = string;
type FunctionId = string;

interface StatementMapEntry extends Range {
  contentHash: string;
}

interface FunctionMapEntry extends FunctionMapping {
  contentHash?: string;
}

export interface IstanbulFileCoverageData {
  path: string;
  statementMap: Record<StatementId, StatementMapEntry>;
  fnMap: Record<FunctionId, FunctionMapEntry>;
  branchMap: Record<string, BranchMapping>;
  s: Record<StatementId, number>;
  f: Record<FunctionId, number>;
  b: Record<string, number[]>;
}

type FileCoverageWithHash = IstanbulFileCoverageData & { contentHash: string };
type CoverageByFile = Record<string, FileCoverageWithHash>;
type CoverageByCommit = Record<string, CoverageByFile>;

function sumCounters(
  base: Record<string, number>,
  incoming: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = { ...base };
  for (const key of Object.keys(incoming)) {
    result[key] = (result[key] || 0) + incoming[key];
  }
  return result;
}

function mergeSameFile(
  base: FileCoverageWithHash,
  incoming: FileCoverageWithHash,
): FileCoverageWithHash {
  base.s = sumCounters(base.s, incoming.s);
  base.f = sumCounters(base.f, incoming.f);
  return base;
}

// 基于语句和函数内容哈希进行合并：当文件内容不同但语句/函数内容可匹配时，按 contentHash 汇总并累加到基准语句/函数上
function mergeByStatementContentHash(
  base: FileCoverageWithHash,
  incoming: FileCoverageWithHash,
): FileCoverageWithHash {
  // 处理语句（statements）
  const incomingStmtHashToCount: Record<string, number> = {};
  for (const [incomingStmtId, count] of Object.entries(incoming.s)) {
    const meta = incoming.statementMap[incomingStmtId];
    if (!meta) continue;
    const hash = meta.contentHash;
    incomingStmtHashToCount[hash] =
      (incomingStmtHashToCount[hash] || 0) + count;
  }

  for (const [baseStmtId, baseCount] of Object.entries(base.s)) {
    const baseMeta = base.statementMap[baseStmtId];
    if (!baseMeta) continue;
    const add = incomingStmtHashToCount[baseMeta.contentHash];
    if (add) {
      base.s[baseStmtId] = baseCount + add;
    }
  }

  // 处理函数（functions）
  const incomingFnHashToCount: Record<string, number> = {};
  for (const [incomingFnId, count] of Object.entries(incoming.f)) {
    const meta = incoming.fnMap[incomingFnId];
    if (!meta || !meta.contentHash) continue;
    const hash = meta.contentHash;
    incomingFnHashToCount[hash] = (incomingFnHashToCount[hash] || 0) + count;
  }

  for (const [baseFnId, baseCount] of Object.entries(base.f)) {
    const baseMeta = base.fnMap[baseFnId];
    if (!baseMeta || !baseMeta.contentHash) continue;
    const add = incomingFnHashToCount[baseMeta.contentHash];
    if (add) {
      base.f[baseFnId] = baseCount + add;
    }
  }

  return base;
}

export const aggregateForCommits = (
  allCoverageByCommit: CoverageByCommit,
  headSha: string,
): CoverageByFile => {
  const base = allCoverageByCommit[headSha];
  if (!base) {
    throw new Error('aggregateForCommits: headSha not found in coverage map');
  }

  for (const commitSha of Object.keys(allCoverageByCommit)) {
    if (commitSha === headSha) continue;
    const incomingByFile = allCoverageByCommit[commitSha];

    for (const filePath of Object.keys(incomingByFile)) {
      const incoming = incomingByFile[filePath];
      const baseFile = base[filePath];

      // 若基准版本不存在该文件，则跳过以保持行为与原逻辑一致
      if (!baseFile) continue;
      if (baseFile.contentHash === '' || baseFile.contentHash === undefined) {
        continue;
      }
      if (baseFile.contentHash === incoming.contentHash) {
        mergeSameFile(baseFile, incoming);
      } else {
        mergeByStatementContentHash(baseFile, incoming);
      }
    }
  }

  return base;
};
