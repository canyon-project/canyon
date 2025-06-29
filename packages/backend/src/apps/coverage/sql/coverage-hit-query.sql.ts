/*
核心
1. 利用ck物化视图 coverage_id, full_file_path 相同的聚合，sumMapMerge
2. branch用了位运算
* */

/**
 * 生成并行查询的 SQL 语句数组
 * 将大的 IN 查询拆分成多个小的并行查询以提高性能
 * @param coverages 覆盖率数据数组
 * @param options 查询选项
 * @param batchSize 每批查询的大小，默认 100
 * @returns SQL 语句数组
 */
export function coverageHitQuerySqlParallel(
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
  batchSize: number = 100,
): string[] {
  const filterCovs = coverages.filter((i) => {
    const reportProviderOff =
      !reportProvider || i.reportProvider === reportProvider;
    const reportIDOff = !reportID || i.reportID === reportID;
    return reportProviderOff && reportIDOff;
  });

  if (filterCovs.length === 0) {
    return [`SELECT
              coverage_id as coverageID,
              full_file_path as fullFilePath,
              sumMapMerge(s) AS s,
              sumMapMerge(f) AS f,
              sumMapMerge(b) AS b
            FROM default.coverage_hit_agg
            WHERE coverage_id IN ('')
            GROUP BY coverage_id, full_file_path;`];
  }

  // 将 coverage IDs 分批
  const batches: string[][] = [];
  for (let i = 0; i < filterCovs.length; i += batchSize) {
    batches.push(filterCovs.slice(i, i + batchSize).map(h => h.id));
  }

  // 为每批生成 SQL 查询
  return batches.map(batch => {
    const in_condition = batch.map(id => `'${id}'`).join(', ');
    return `SELECT
              coverage_id as coverageID,
              full_file_path as fullFilePath,
              sumMapMerge(s) AS s,
              sumMapMerge(f) AS f,
              sumMapMerge(b) AS b
            FROM default.coverage_hit_agg
            WHERE coverage_id IN (${in_condition})
            GROUP BY coverage_id, full_file_path;`;
  });
}

/**
 * 生成并行查询的 SQL 语句数组（简化版本，只查询 statement 覆盖率）
 * 将大的 IN 查询拆分成多个小的并行查询以提高性能
 * @param coverageIds coverage ID 数组
 * @param batchSize 每批查询的大小，默认 100
 * @returns SQL 语句数组
 */
export function coverageHitQuerySqlParallelSimple(
  coverageIds: string[],
  batchSize: number = 100,
): string[] {
  if (coverageIds.length === 0) {
    return [`SELECT
              coverage_id as coverageID,
              full_file_path as fullFilePath,
              tupleElement(sumMapMerge(s), 1) AS s
            FROM default.coverage_hit_agg
            WHERE coverage_id IN ('')
            GROUP BY coverage_id, full_file_path;`];
  }

  // 将 coverage IDs 分批
  const batches: string[][] = [];
  for (let i = 0; i < coverageIds.length; i += batchSize) {
    batches.push(coverageIds.slice(i, i + batchSize));
  }

  // 为每批生成 SQL 查询
  return batches.map(batch => {
    const in_condition = batch.map(id => `'${id}'`).join(', ');
    return `SELECT
              coverage_id as coverageID,
              full_file_path as fullFilePath,
              tupleElement(sumMapMerge(s), 1) AS s
            FROM default.coverage_hit_agg
            WHERE coverage_id IN (${in_condition})
            GROUP BY coverage_id, full_file_path;`;
  });
}

/**
 * 并行查询的优势：
 * 1. 减少单个查询的复杂度，提高 ClickHouse 查询优化器的效率
 * 2. 避免大 IN 子句导致的性能问题
 * 3. 利用 ClickHouse 的并行处理能力
 * 4. 当 coverage_id 数量很大时，性能提升明显
 *
 * 使用建议：
 * - 当 coverage_id 数量 > 100 时，建议使用并行查询
 * - batchSize 建议设置为 50-200 之间，根据数据量和 ClickHouse 配置调整
 * - 对于小数据量（< 50个 coverage_id），使用原始函数即可
 */
