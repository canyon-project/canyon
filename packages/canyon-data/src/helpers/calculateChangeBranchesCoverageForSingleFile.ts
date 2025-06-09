import { FileCoverageData, Range } from "istanbul-lib-coverage";
import {percent} from "../util.ts";
export function calculateChangeBranchesCoverageForSingleFile(
  coverage: FileCoverageData,
  newLine: number[],
) {
  let total = 0;
  let covered = 0;

  Object.entries(coverage.branchMap).forEach(([key,value])=>{
    Object.entries(value.locations).forEach(([key2,value2])=>{
      const startAndEnd = [value2.start.line, value2.end.line];
      if (newLine.some(line => line >= startAndEnd[0] && line <= startAndEnd[1])) {
        total++;
        // @ts-ignore
        if (coverage.b[key][key2] > 0) {
          covered++;
        }
      }
    })
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
