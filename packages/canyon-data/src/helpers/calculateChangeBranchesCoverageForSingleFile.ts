import { FileCoverageData } from "istanbul-lib-coverage";
import {percent} from "../util.ts";
function genRange(range:any) {
  if (range && range?.start?.line && range?.start?.line){
    return [range.start.line, range.end.line];
  } else {
    return [-1, -1];
  }
}
export function calculateChangeBranchesCoverageForSingleFile(
  coverage: FileCoverageData,
  newLine: number[],
) {
  let total = 0;
  let covered = 0;

  Object.entries(coverage.b).forEach(([_,hitList],index) => {
    for (let i = 0; i < hitList.length; i++) {
      const hit = hitList[i];
      const value = coverage.branchMap[index].locations[i];
      const startAndEnd = genRange(value);
      if (newLine.some(line => line >= startAndEnd[0] && line <= startAndEnd[1])) {
        total++;
        // @ts-ignore
        if (hit > 0) {
          covered++;
        }
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
