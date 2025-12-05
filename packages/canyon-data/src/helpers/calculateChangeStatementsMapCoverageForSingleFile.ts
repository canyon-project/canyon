import { FileCoverageData } from "istanbul-lib-coverage";
import {percent} from "../util.ts";
export function calculateChangeStatementsMapCoverageForSingleFile(
  coverage: FileCoverageData,
  newLine: number[],
) {
  let total = 0;
  let covered = 0;

  Object.entries(coverage.statementMap).forEach(([key,value])=>{
    const startAndEnd = [value.start.line,value.end.line]
    if (newLine.some(line => line >= startAndEnd[0] && line <= startAndEnd[1])) {
      total++;
      if (coverage.s[key] > 0) {
        covered++;
      }
    }
  })
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
