import { Dims } from './Report';

export const classForPercent = (
  type: Dims,
  value: number,
  _watermarks: any,
) => {
  const watermarks = _watermarks[type];
  if (!watermarks) {
    return 'unknown';
  }
  if (value < watermarks[0]) {
    return 'low';
  }
  if (value >= watermarks[1]) {
    return 'high';
  }
  return 'medium';
};

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
