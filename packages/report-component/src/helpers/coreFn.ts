export function coreFn(
  fileCoverage: any,
  fileDetail: string,
): {
  times: {
    lineNumber: number;
    count: number;
  }[];
  rows: string[];
  maxWidth: number;
  lines: {
    executionNumber: number;
  }[];
} {
  const nullData = {
    times: [],
    rows: [],
    maxWidth: 0,
    lines: [],
  };
  if (!fileCoverage.s) {
    return nullData;
  }

  const content = fileDetail;
  // 1.转换成数组
  const rows = [''];
  let index = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
      index += 1;
      rows.push('');
    } else {
      rows[index] += content[i];
    }
  }
  const maxWidth = JSON.parse(JSON.stringify(rows)).sort(
    (a: string, b: string) => -(a.length - b.length),
  )[0].length;

  // 获取numberOfRows
  // 获取行覆盖率
  function getLineCoverage(data: any) {
    const statementMap = data.statementMap;
    const statements = data.s;
    const lineMap = Object.create(null);
    Object.entries(statements).forEach(([st, count]: any) => {
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

  // 计算行
  const lineStats = getLineCoverage(fileCoverage);
  if (!lineStats) {
    return nullData;
  }
  // numberOfRows
  const numberOfRows: any[] = [];
  Object.entries(lineStats).forEach(([lineNumber, count]) => {
    numberOfRows.push({ lineNumber, count });
    // 这边计算出了行的次数！！！！！！
  });

  const lines = [];
  for (let i = 0; i < rows.length; i++) {
    if (numberOfRows.find((n) => Number(n.lineNumber) === i + 1)) {
      lines.push({
        executionNumber: numberOfRows.find(
          (n) => Number(n.lineNumber) === i + 1,
        ).count,
      });
    } else {
      lines.push({
        executionNumber: -1,
      });
    }
  }
  return {
    times: numberOfRows,
    rows,
    lines,
    maxWidth,
  };
}
