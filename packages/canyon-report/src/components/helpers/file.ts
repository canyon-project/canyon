// 获取numberOfRows
// 获取行覆盖率
function getLineCoverage(data) {
  const statementMap = data.statementMap;
  const statements = data.s;
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
export const genFileDetailLines = (fileCoverage, fileContent) => {
  // console.log(coverage)
  const totalLines = fileContent.split("\n").length;
  const lineStats = getLineCoverage(fileCoverage);
  // console.log(lineStats); 很奇怪，打开nextjs会报错
  return Array.from({ length: totalLines }, (_, index) => {
    return {
      count: lineStats[index + 1],
    };
  });
};

export function mergeIntervals(intervals) {
  // 如果输入为空，直接返回空列表
  if (intervals.length === 0) {
    return [];
  }

  // 将所有线段按起始位置进行排序
  intervals.sort((a, b) => a[0] - b[0]);

  // 初始化结果列表
  const merged = [];
  let [currentStart, currentEnd] = intervals[0];

  for (const [start, end] of intervals.slice(1)) {
    if (start <= currentEnd) {
      // 当前线段与前一个线段有重叠
      currentEnd = Math.max(currentEnd, end); // 更新结束位置
    } else {
      // 当前线段与前一个线段没有重叠
      merged.push([currentStart, currentEnd]); // 将前一个线段加入结果列表
      [currentStart, currentEnd] = [start, end]; // 更新当前线段的起始和结束位置
    }
  }

  // 添加最后一个线段
  merged.push([currentStart, currentEnd]);

  return merged;
}

export const ggggggfn = (filecoverage, fileContent) => {
  const statementStats = filecoverage.s;
  const statementMeta = filecoverage.statementMap;
  const structuredText = fileContent
    .split("\n")
    .reduce((previousValue, currentValue, currentIndex) => {
      return {
        ...previousValue,
        [currentIndex]: currentValue,
      };
    }, {});
  const statementDecorations = [];

  Object.entries(statementStats).forEach(([stName, count]) => {
    const meta = statementMeta[stName];
    if (meta) {
      const type = count > 0 ? "yes" : "no";
      const startCol = meta.start.column;
      const endCol = meta.end.column + 1;
      const startLine = meta.start.line;
      const endLine = meta.end.line;

      if (type === "no" && structuredText[startLine]) {
        if (endLine !== startLine) {
          // endCol = structuredText[startLine].length;
        }
        //     转化为字符的起始

        let start = 0;
        let end = 0;

        for (let i = 0; i < startLine - 1; i++) {
          start += structuredText[i].length + 1;
        }
        for (let i = 0; i < endLine - 1; i++) {
          // TODO: 这里有问题，可能是源码编译前有代码格式化
          end += (structuredText[i]?.length || 0) + 1;
        }

        start += startCol;
        end += endCol;
        statementDecorations.push([start, end]);
      }
    }
  });

  const fnDecorations = [];
  const fnStats = filecoverage.f;
  const fnMeta = filecoverage.fnMap;
  Object.entries(fnStats).forEach(([fName, count]) => {
    const meta = fnMeta[fName];
    if (meta) {
      const type = count > 0 ? "yes" : "no";
      // Some versions of the instrumenter in the wild populate 'func'
      // but not 'decl':
      const decl = meta.decl || meta.loc;
      const startCol = decl.start.column;
      const endCol = decl.end.column + 1;
      const startLine = decl.start.line;
      const endLine = decl.end.line;

      if (type === "no" && structuredText[startLine]) {
        if (endLine !== startLine) {
          // endCol = structuredText[startLine].length;
        }

        //     转化为字符的起始

        let start = 0;
        let end = 0;

        for (let i = 0; i < startLine - 1; i++) {
          start += structuredText[i].length + 1;
        }
        for (let i = 0; i < endLine - 1; i++) {
          end += structuredText[i].length + 1;
        }

        start += startCol;
        end += endCol;
        fnDecorations.push([start, end]);
      }
    }
  });

  const branchStats = filecoverage.b;
  const branchMeta = filecoverage.branchMap;

  const branchDecorations = [];

  function specialLogicByIf(branchRange, index) {
    if (
      branchRange.type === "if" &&
      branchRange.locations.length > 1 &&
      Number(index) === 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  Object.entries(branchStats).forEach(([bName, counts]) => {
    const meta = branchMeta[bName];
    if (meta) {
      Object.entries(meta.locations).forEach(([index, location]) => {
        const count = counts[index];
        if (count === 0 && specialLogicByIf(meta)) {
          const startCol = location.start.column;
          const endCol = location.end.column + 1;
          const startLine = location.start.line;
          const endLine = location.end.line;

          //     转化为字符的起始

          let start = 0;
          let end = 0;

          for (let i = 0; i < startLine - 1; i++) {
            start += structuredText[i].length + 1;
          }
          for (let i = 0; i < endLine - 1; i++) {
            end += structuredText[i].length + 1;
          }

          start += startCol;
          end += endCol;
          branchDecorations.push([start, end]);
        }
      });
    }
  });

  return mergeIntervals(
    [...statementDecorations, ...fnDecorations, ...branchDecorations].filter(
      (item) => {
        // defaultValue
        if (item[0] >= item[1]) {
          return false;
        } else if (item[1] > fileContent.length) {
          return false;
        } else {
          return item[0] < item[1];
        }
      },
    ),
  ).map(([start, end]) => {
    return {
      start,
      end,
      properties: { class: "content-class-no-found" },
    };
  });
};
