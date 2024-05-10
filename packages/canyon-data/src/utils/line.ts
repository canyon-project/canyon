import {FileCoverageData, Range} from "istanbul-lib-coverage";

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
  const lineStats = getLineCoverage(coverage.statementMap,coverage.s);
  const rows:[string,unknown][] = [];
  Object.entries(lineStats).forEach(([lineNumber, count]) => {
    if (newLine.includes(Number(lineNumber))) {
      rows.push([lineNumber, count]);
    }
  });
  return {
    total: newLine.length,
    covered: newLine.length - rows.filter((i) => !i[1]).length,
    skipped: 0,
    pct:0
  };
}
