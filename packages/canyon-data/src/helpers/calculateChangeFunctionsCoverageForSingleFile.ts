import { FileCoverageData, Range } from "istanbul-lib-coverage";
import {percent} from "../util.ts";
export function calculateChangeFunctionsCoverageForSingleFile(
  coverage: FileCoverageData,
  newLine: number[],
) {
  let total = 0;
  let covered = 0;

  Object.entries(coverage.fnMap).forEach(([key,value])=>{
    const startAndEnd = [value.decl.start.line,value.decl.end.line]
    if (newLine.some(line => line >= startAndEnd[0] && line <= startAndEnd[1])) {
      total++;
      if (coverage.f[key] > 0) {
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
