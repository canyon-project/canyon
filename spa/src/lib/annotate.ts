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
        type:'S',
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
        type:'F',
      });
    }
  });
  return list;
}

export function annotateBranches(fileCoverage, structuredText) {
  const branchStats = fileCoverage.b;
  const branchMeta = fileCoverage.branchMap;
  if (!branchStats) {
    return [];
  }

  const arr = [];

  Object.entries(branchStats).forEach(([branchName, branchArray]) => {
    const sumCount = branchArray.reduce((p, n) => p + n, 0);
    const metaArray = branchMeta[branchName].locations;
    let i;
    let count;
    let meta;
    let startCol;
    let endCol;
    let startLine;
    let endLine;
    let openSpan;
    let closeSpan;
    let text;




    // only highlight if partial branches are missing or if there is a
    // single uncovered branch.
    if (sumCount > 0 || (sumCount === 0 && branchArray.length === 1)) {
      // Need to recover the metaArray placeholder item to count an implicit else
      if (
        // Check if the branch is a conditional if branch.
        branchMeta[branchName].type === 'if' &&
        // Check if the branch has an implicit else.
        branchArray.length === 2 &&
        // Check if the implicit else branch is unaccounted for.
        metaArray.length === 1 &&
        // Check if the implicit else branch is uncovered.
        branchArray[1] === 0
      ) {
        metaArray[1] = {
          start: {},
          end: {}
        };
      }

      for (
        i = 0;
        i < branchArray.length && i < metaArray.length;
        i += 1
      ) {
        count = branchArray[i];
        meta = metaArray[i];
        startCol = meta.start.column;
        endCol = meta.end.column + 1;
        startLine = meta.start.line;
        endLine = meta.end.line;

        // If the branch is an implicit else from an if statement,
        // then the coverage report won't show a statistic.
        // Therefore, the previous branch will be used to report that
        // there is no coverage on that implicit branch.
        if (
          count === 0 &&
          startLine === undefined &&
          branchMeta[branchName].type === 'if'
        ) {
          const prevMeta = metaArray[i - 1];
          startCol = prevMeta.start.column;
          endCol = prevMeta.end.column + 1;
          startLine = prevMeta.start.line;
          endLine = prevMeta.end.line;
        }

        if (count === 0 && structuredText[startLine]) {
          //skip branches taken
          if (endLine !== startLine) {
            // endCol = structuredText[
            //   startLine
            //   ].text.originalLength();
          }
          text = structuredText[startLine].text;
          if (branchMeta[branchName].type === 'if') {
            arr.push({
              startLine,
              endLine,
              startCol: startCol + 1,
              endCol: endCol + 1,
              type: (i === 0 ? 'I' : 'E'),
              skip: meta.skip,
            })
          } else {
            arr.push({
              startLine,
              endLine,
              startCol: startCol + 1,
              endCol: endCol + 1,
              type: 'B',
              skip: meta.skip,
            })
          }
        }
      }
    }
  });
  return arr
}
