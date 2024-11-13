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

function specialLogicByIf(branchRange,index) {
  if (branchRange.type === "if" && branchRange.locations.length > 1 && Number(index) === 0) {
    return false;
  } else {
    return true;
  }
}

export function calculateNewLineCoverageForSingleFile(coverage:FileCoverageData, newLine:number[]) {

/*  变更行覆盖率计算
1. 遍历所有未语句、函数、分支，找到所有未覆盖行
2. git diff 找到新增的代码行
3. 找到新增代码行中哪些属于未覆盖行
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
      // branch类型是if，并且有多个分支的，第一个if的location范围是整个分支的范围，所以如果它未覆盖，会导致标注的时候整个分支红色，先剔除。
      if (coverage.b[key][index] === 0 && specialLogicByIf(branchRange,index)){
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
