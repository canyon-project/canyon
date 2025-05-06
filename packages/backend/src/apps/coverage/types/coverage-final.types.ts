export interface CoverageHitQuerySqlResultJsonInterface {
  coverage_id: string;
  file_path: string;
  merged_s: [string[], number[]];
  merged_f: [string[], number[]];
  merged_b: [string[], number[]];
}

export interface CoverageMapQuerySqlResultJsonInterface {
  hash: string;
  statement_map: Record<string, [number, number, number, number]>;
  fn_map: Record<
    string,
    [
      string,
      number,
      [number, number, number, number],
      [number, number, number, number],
    ]
  >;
  branch_map: Record<
    string,
    [
      number,
      number,
      [number, number, number, number],
      [number, number, number, number][],
    ]
  >;
  restore_statement_map: Record<string, [number, number, number, number]>;
  restore_fn_map: Record<
    string,
    [
      string,
      number,
      [number, number, number, number],
      [number, number, number, number],
    ]
  >;
  restore_branch_map: Record<
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
