export function changeModeFilterIrrelevantData(coverage,diff) {
  const addLines = diff.additions || [];
  const statementMap = coverage['statementMap'] || {};
  const s = coverage['s'] || {};
  const newStatementMap = {};
  const newS = {};

  // 过滤语句覆盖数据，遍历语句，遍历addLines，如果语句的start.line - end.line之间有addLines，则保留该语句覆盖数据
  Object.keys(statementMap).forEach((key) => {
    const statement = statementMap[key];
    const startLine = statement.start.line;
    const endLine = statement.end.line;

    for (let line = startLine; line <= endLine; line++) {
      if (addLines.includes(line)) {
        newStatementMap[key] = statement;
        newS[key] = s[key];
        break;
      }
    }
  });

  return {
    path: coverage['path'],
    branchMap: {},
    b: {},
    fnMap: {},
    f: {},
    statementMap: newStatementMap,
    s: newS,
  }
}
