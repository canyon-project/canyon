export function annotateStatements(fileCoverage: any) {
  const annotateStatementsList: any[] = [];
  const statementStats = fileCoverage.s;
  const statementMeta = fileCoverage.statementMap;
  Object.entries(statementStats).forEach(([stName, count]: any) => {
    const meta = statementMeta[stName];
    const type = count > 0 ? "yes" : "no";
    const startCol = meta.start.column;
    const endCol = meta.end.column + 1;
    const startLine = meta.start.line;
    const endLine = meta.end.line;
    if (type === "no") {
      annotateStatementsList.push({
        startLine,
        endLine,
        startCol:startCol+1,
        endCol:endCol+1,
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
    const type = count > 0 ? "yes" : "no";
    // Some versions of the instrumenter in the wild populate 'func'
    // but not 'decl':
    const decl = meta.decl || meta.loc;
    const startCol = decl.start.column;
    let endCol = decl.end.column + 1;
    const startLine = decl.start.line;
    const endLine = decl.end.line;
    if (type === "no") {
      if (endLine !== startLine) {
        endCol = structuredText[startLine - 1].length;
      }
      list.push({
        startLine,
        endLine,
        startCol:startCol+1,
        endCol:endCol+1,
        type,
      });
    }
  });
  return list;
}
