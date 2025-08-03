/*
核心
1. 利用ck物化视图 coverage_id, full_file_path 相同的聚合，sumMapMerge
2. branch用了位运算
3. 为什么要在这里筛选？因为需要全量的coverage id来筛选出coverage_map
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
  const filterCovs = coverages.filter((i) => {
    const reportProviderOff =
      !reportProvider || i.reportProvider === reportProvider;
    const reportIDOff = !reportID || i.reportID === reportID;
    return reportProviderOff && reportIDOff;
  });

  // 这里不需要 coverage_id 的group by，因为coverage_id已经通过report_id筛选了

  const in_condition =
    filterCovs.length > 0
      ? `${filterCovs.map((h) => `'${h.id}'`).join(', ')}`
      : `''`;
  return `SELECT
            full_file_path as fullFilePath,
            sumMapMerge(s) AS s,
            sumMapMerge(f) AS f,
            sumMapMerge(b) AS b
          FROM default.coverage_hit_agg
          WHERE coverage_id IN (${in_condition})
          GROUP BY full_file_path;`;
}
