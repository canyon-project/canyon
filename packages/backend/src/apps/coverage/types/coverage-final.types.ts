export interface CoverageHitQuerySqlResultJsonInterface {
  coverageID: string;
  fullFilePath: string;
  s: [string[], number[]];
  f: [string[], number[]];
  b: [string[], number[]];
}

export interface CoverageMapQuerySqlResultJsonInterface {
  coverageMapHashID: string;
  statementMap: Record<string, [number, number, number, number]>;
  fnMap: Record<
    string,
    [
      string,
      number,
      [number, number, number, number],
      [number, number, number, number],
    ]
  >;
  branchMap: Record<
    string,
    [
      number,
      number,
      [number, number, number, number],
      [number, number, number, number][],
    ]
  >;
  restoreStatementMap: Record<string, [number, number, number, number]>;
  restoreFnMap: Record<
    string,
    [
      string,
      number,
      [number, number, number, number],
      [number, number, number, number],
    ]
  >;
  restoreBranchMap: Record<
    string,
    [
      number,
      number,
      [number, number, number, number],
      [number, number, number, number][],
    ]
  >;
  ts: string;
}
