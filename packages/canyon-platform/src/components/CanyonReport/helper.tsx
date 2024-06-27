// 批注语句

export function annotateStatements(fileCoverage: any) {
  const annotateStatementsList: any[] = [];
  const statementStats = fileCoverage.s;
  const statementMeta = fileCoverage.statementMap;
  Object.entries(statementStats).forEach(([stName, count]: any) => {
    const meta = statementMeta[stName];
    const type = count > 0 ? 'yes' : 'no';
    const startCol = meta.start.column;
    const endCol = meta.end.column + 1;
    const startLine = meta.start.line;
    const endLine = meta.end.line;
    if (type === 'no') {
      annotateStatementsList.push({
        startLine,
        endLine,
        startCol,
        endCol,
        type,
      });
    }
  });
  return annotateStatementsList;
}

export function annotateFunctions(fileCoverage, structuredText) {
  const fnStats = fileCoverage.f;
  const fnMeta = fileCoverage.fnMap;
  if (!fnStats) {
    return [];
  }
  const list = [];
  Object.entries(fnStats).forEach(([fName, count]) => {
    const meta = fnMeta[fName];
    const type = count > 0 ? 'yes' : 'no';
    // Some versions of the instrumenter in the wild populate 'func'
    // but not 'decl':
    const decl = meta.decl || meta.loc;
    const startCol = decl.start.column;
    let endCol = decl.end.column + 1;
    const startLine = decl.start.line;
    const endLine = decl.end.line;
    if (type === 'no') {
      if (endLine !== startLine) {
        console.log('???????');
        endCol = structuredText[startLine - 1].length;
      }
      list.push({
        startLine,
        endLine,
        startCol,
        endCol,
        type,
      });
    }
  });
  return list;
}

export function convertingProductionFunctions(
  startEnds: { start: number; end: number }[],
  sourcecode: string,
) {
  // codeLines是源码的每一行
  const codeLines = sourcecode.split('\n');

  const result = [];

  for (let g = 0; g < startEnds.length; g++) {
    const xy = [];
    let count = 0;
    for (let i = 0; i < codeLines.length; i++) {
      const line = codeLines[i];
      // 注意这块，需要加1，因为split('\n')的时候，每一行的末尾是没有\n的
      for (let j = 0; j < line.length + 1; j++) {
        if (count === startEnds[g].start || count === startEnds[g].end) {
          xy.push({
            l: i + 1,
            c: j + 1,
          });
        }
        count++;
      }
    }
    result.push(xy);
  }
  return result.map((i) => {
    return {
      startLine: i[0].l,
      startCol: i[0].c,
      endLine: i[1].l,
      endCol: i[1].c,
    };
  });
}

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
        executionNumber: numberOfRows.find((n) => Number(n.lineNumber) === i + 1).count,
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

export function genDecorationsLv2Array(code, startends) {
  const lines = code.split('\n');
  function convertRanges(arr) {
    const result = [];
    arr.forEach((data) => {
      const start = data.start;
      const end = data.end;

      for (let i = start[0]; i <= end[0]; i++) {
        const intervalStart = i === start[0] ? start[1] : 0;
        const intervalEnd = lines[i].length;
        result.push([i, intervalStart, intervalEnd]);
      }
    });
    // 输出每一行的区间值
    return result;
  }

  const convertedData = convertRanges(startends);
  function mergeRanges(ranges) {
    // 对区间按照起始位置进行排序
    ranges.sort((a, b) => a[0] - b[0]);

    const merged = [];

    let currentRange = ranges[0];
    for (let i = 1; i < ranges.length; i++) {
      const nextRange = ranges[i];

      // 如果当前区间和下一个区间有重叠，则合并它们
      if (currentRange[1] >= nextRange[0]) {
        currentRange[1] = Math.max(currentRange[1], nextRange[1]);
      } else {
        merged.push(currentRange);
        currentRange = nextRange;
      }
    }

    merged.push(currentRange);

    return merged;
  }

  function mergeRows(array) {
    const groupedRows = {};

    // 将相同行的元素分组
    array.forEach(([row, col, value]) => {
      if (!groupedRows[row]) {
        groupedRows[row] = [];
      }
      groupedRows[row].push([col, value]);
    });

    const mergedArray = [];

    // 对每个分组合并区间
    for (const row in groupedRows) {
      const mergedRanges = mergeRanges(groupedRows[row]);
      mergedRanges.forEach((range) => {
        mergedArray.push([parseInt(row), range[0], range[1]]);
      });
    }

    return mergedArray;
  }

  const mergedArray = mergeRows(convertedData);
  return mergedArray;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function checkSuffix(path) {
  //   只要path里含有vue、js、jsx等就返回true
  return (
    path.includes('.vue') ||
    path.includes('.js') ||
    path.includes('.jsx') ||
    path.includes('.ts') ||
    path.includes('.tsx')
  );
}
