import {FileCoverageData, Range} from "istanbul-lib-coverage";
import {percent} from "./percent.ts";

function getLinesFromRanges(ranges) {
  const lines = [];
  for (const range of ranges) {
    for (let lineNumber = range.startLine; lineNumber <= range.endLine; lineNumber++) {
      lines.push(lineNumber);
    }
  }
  return [...new Set(lines)];
}


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
1. 遍历s，f，b，找出没有覆盖的行
2. 看哪些新增行在没有覆盖的行中
*/
  const noCovered: { startLine: number; endLine: number; }[] = []
  Object.entries(coverage.s).forEach(([key, count]) => {
    if (coverage.statementMap[key] && count===0){
      noCovered.push({
        startLine: coverage.statementMap[key].start.line,
        endLine: coverage.statementMap[key].end.line
      })
    }
  })
  Object.entries(coverage.f).forEach(([key, count]) => {
    if (coverage.fnMap[key] && count===0){
      noCovered.push({
        startLine: coverage.fnMap[key].decl.start.line,
        endLine: coverage.fnMap[key].decl.end.line
      })
    }
  })


  Object.keys(coverage.branchMap).forEach((key) => {
    const branchRange = coverage.branchMap[key];
    branchRange.locations.forEach((location,index) => {
      if (coverage.b[key][index] === 0){
        noCovered.push({
          startLine: location.start.line,
          endLine: location.end.line
        })
      }
    });
  });

  const noCoveredLines = getLinesFromRanges(noCovered);

  return {
    total: newLine.length,
    covered: newLine.filter((line) => !noCoveredLines.includes(line)).length,
    skipped: 0,
    pct: percent(newLine.filter((line) => !noCoveredLines.includes(line)).length, newLine.length)
  }
}
