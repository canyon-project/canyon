import { BranchMapping, FunctionMapping, Range } from 'istanbul-lib-coverage';

// 核心，
// 0. 必须得先上报，不在__coverage__对象里加
// 1. babel插件，
// 2. @canyonjs/cli upload
// 3. canyon-crn里
// 4. gitlab ci里

type StatementId = string;

interface StatementMapEntry extends Range {
  contentHash: string;
}

export interface IstanbulFileCoverageData {
  path: string;
  statementMap: Record<StatementId, StatementMapEntry>;
  fnMap: Record<string, FunctionMapping>;
  branchMap: Record<string, BranchMapping>;
  s: Record<StatementId, number>;
  f: Record<string, number>;
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
  return base;
}

// 基于语句内容哈希进行合并：当文件内容不同但语句内容可匹配时，按 contentHash 汇总并累加到基准语句上
function mergeByStatementContentHash(
  base: FileCoverageWithHash,
  incoming: FileCoverageWithHash,
): FileCoverageWithHash {
  const incomingHashToCount: Record<string, number> = {};
  for (const [incomingStmtId, count] of Object.entries(incoming.s)) {
    const meta = incoming.statementMap[incomingStmtId];
    if (!meta) continue;
    const hash = meta.contentHash;
    incomingHashToCount[hash] = (incomingHashToCount[hash] || 0) + count;
  }

  for (const [baseStmtId, baseCount] of Object.entries(base.s)) {
    const baseMeta = base.statementMap[baseStmtId];
    if (!baseMeta) continue;
    const add = incomingHashToCount[baseMeta.contentHash];
    if (add) {
      base.s[baseStmtId] = baseCount + add;
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
