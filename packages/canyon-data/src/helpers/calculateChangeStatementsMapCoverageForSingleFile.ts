import { FileCoverageData } from "istanbul-lib-coverage";
import {percent} from "../util.ts";
export function calculateChangeStatementsMapCoverageForSingleFile(
  coverage: FileCoverageData,
  newLine: number[],
) {
  // 收集所有与新增行有交集的语句，作为“相关联语句”全集（分母）
  const relatedStatementKeys = new Set<string>();
  Object.entries(coverage.statementMap).forEach(([key, value]) => {
    const startLine = value.start.line;
    const endLine = value.end.line;
    if (newLine.some((line) => line >= startLine && line <= endLine)) {
      relatedStatementKeys.add(key);
    }
  });

  const total = relatedStatementKeys.size;
  let covered = 0;
  relatedStatementKeys.forEach((key) => {
    if (coverage.s[key] > 0) {
      covered++;
    }
  });
  return {
    total,
    covered,
    skipped: 0,
    pct: percent(
      covered,
      total,
    ),
  }
}
