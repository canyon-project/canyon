import {FileCoverageData, Range} from "istanbul-lib-coverage";
import {percent} from "./percent.ts";

/**
 * returns computed line coverage from statement coverage.
 * This is a map of hits keyed by line number in the source.
 */
function getLineCoverage(statementMap:{ [key: string]: Range },s:{ [key: string]: number }) {
  const statements = s;
  const lineMap = Object.create(null);

  Object.entries(statements).forEach(([st, count]) => {
    if (!statementMap[st]) {
      return;
    }
    const { line } = statementMap[st].start;
    const prevVal = lineMap[line];
    if (prevVal === undefined || prevVal < count) {
      lineMap[line] = count;
    }
  });
  return lineMap;
}


export function calculateNewLineCoverageForSingleFile(coverage:FileCoverageData, newLine:number[]) {

/*  变更行覆盖率计算
1. 遍历变更行，判断是否在s、f、b中
2. 如果在其中，只统计这部分行的覆盖率
3. 在其中，且他们的hit大于0，就是覆盖的
*/

  const newLineResult = []
  for (let i = 0; i < newLine.length; i++) {
    const line = newLine[i];

    let isCovered = false
    let isLand = false

    Object.keys(coverage.statementMap).forEach((key) => {
      const statementRange = coverage.statementMap[key];
      if (statementRange.start.line <= line && statementRange.end.line >= line) {
        isLand = true
        if ( coverage.s[key] > 0){
          isCovered = true
        }
      }
    });

    Object.keys(coverage.fnMap).forEach((key) => {
      const fnRange = coverage.fnMap[key];
      if (fnRange.decl.start.line <= line && fnRange.decl.end.line >= line) {
        isLand = true
        if (coverage.f[key] > 0) {
          isCovered = true
        }
      }
    });

    Object.keys(coverage.branchMap).forEach((key) => {
      const branchRange = coverage.branchMap[key];
      branchRange.locations.forEach((location,index) => {
        if (location.start.line <= line && location.end.line >= line) {
          isLand = true
          if (coverage.b[key][index] > 0){
            isCovered = true
          }
        }
      });
    });
    newLineResult.push({
      line,
      covered: isCovered,
      isLand
    })
  }

  const newLineResultIsLand = newLineResult.filter((l) => l.isLand)

  const result = {
    total: newLineResultIsLand.length,
    covered: newLineResultIsLand.filter((l) => l.covered).length,
    skipped: 0,
    pct: percent(newLineResultIsLand.filter((l) => l.covered).length, newLineResultIsLand.length)
  }
  return result
}
