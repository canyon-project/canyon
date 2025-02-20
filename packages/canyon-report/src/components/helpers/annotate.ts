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
        startCol: startCol + 1,
        endCol: endCol + 1,
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
        startCol: startCol + 1,
        endCol: endCol + 1,
        type,
      });
    }
  });
  return list;
}

export function annotateBranches(fileCoverage, structuredText) {
  const branchStats = fileCoverage.b;
  const branchMeta = fileCoverage.branchMap;
  const annotateBranchesList: any[] = [];

  if (!branchStats) {
    return annotateBranchesList;
  }

  Object.entries(branchStats).forEach(([branchName, branchArray]) => {
    const sumCount = branchArray.reduce((p, n) => p + n, 0);
    const metaArray = branchMeta[branchName].locations;

    // only highlight if partial branches are missing or if there is a single uncovered branch.
    if (sumCount > 0 || (sumCount === 0 && branchArray.length === 1)) {
      // Recover metaArray for implicit else (special case)
      if (
        branchMeta[branchName].type === "if" &&
        branchArray.length === 2 &&
        metaArray.length === 1 &&
        branchArray[1] === 0
      ) {
        metaArray[1] = { start: {}, end: {} };
      }

      metaArray.forEach((meta, index) => {
        const count = branchArray[index];
        const { start, end } = meta;
        let { column: startCol, line: startLine } = start;
        let { column: endCol, line: endLine } = end;

        // Handle implicit else branches
        if (
          count === 0 &&
          startLine === undefined &&
          branchMeta[branchName].type === "if"
        ) {
          const prevMeta = metaArray[index - 1];
          startCol = prevMeta.start.column;
          endCol = prevMeta.end.column + 1;
          startLine = prevMeta.start.line;
          endLine = prevMeta.end.line;
        }

        if (count === 0 && structuredText[startLine]) {
          // Skip branches taken, handle multi-line spans
          if (endLine !== startLine) {
            endCol = structuredText[startLine].text.originalLength();
          }

          annotateBranchesList.push({
            startLine,
            endLine,
            startCol: startCol + 1,
            endCol: endCol + 1,
            type: count === 0 ? "no" : "yes",
          });
        }
      });
    }
  });
  return annotateBranchesList;
}
