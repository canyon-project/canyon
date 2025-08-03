export function coverageMapQuerySql(hashList: string[]): string {
  return `
    SELECT statement_map as statementMap,fn_map as fnMap,branch_map as branchMap,
           restore_statement_map as restoreStatementMap,restore_fn_map as restoreFnMap,restore_branch_map as restoreBranchMap,
           hash as coverageMapHashID
    FROM coverage_map
    WHERE hash IN (${hashList.map((hash) => `'${hash}'`).join(', ')});
  `;
}
