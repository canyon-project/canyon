/*
核心
1. 利用ck物化视图 coverage_id, relative_path 相同的聚合，sumMapMerge
2. branch用了位运算
* */

export function coverageHitQuerySql(
  coverages: {
    id: string;
    reportProvider: string;
    reportID: string;
  }[],
  {
    reportProvider,
    reportID,
  }: {
    reportProvider?: string;
    reportID?: string;
  },
): string {
  return `SELECT
            coverage_id,
            relative_path,
            sumMapMerge(s_map) AS merged_s,
            sumMapMerge(f_map) AS merged_f,
            sumMapMerge(b_map) AS merged_b
          FROM default.coverage_hit_agg
          WHERE coverage_id IN (${coverages
            .filter((i) => {
              const reportProviderOff =
                reportProvider === undefined ||
                i.reportProvider === reportProvider;
              const reportIDOff =
                reportProvider === undefined || i.reportID === reportID;
              return reportProviderOff && reportIDOff;
            })
            .map((h) => `'${h.id}'`)
            .join(', ')})
          GROUP BY coverage_id, relative_path;`;
}
