export interface CoverageHitQuerySqlResultJsonInterface {
  coverage_id: string;
  relative_path: string;
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
  no_transform_statement_map: Record<string, [number, number, number, number]>;
  no_transform_fn_map: Record<
    string,
    [
      string,
      number,
      [number, number, number, number],
      [number, number, number, number],
    ]
  >;
  no_transform_branch_map: Record<
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
