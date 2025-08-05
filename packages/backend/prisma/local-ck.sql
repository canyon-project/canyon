-- 覆盖率hit表 ttl需要短一些，不然数据膨胀速度极快
CREATE TABLE IF NOT EXISTS default.coverage_hit
(
  coverage_id     String,
  full_file_path       String,
  s               Map(UInt32, UInt32),
  f               Map(UInt32, UInt32),
  b               Map(UInt32, UInt32),
  ts              DateTime
  ) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(ts)
  ORDER BY (ts)
  TTL ts + toIntervalHour(12);

CREATE TABLE IF NOT EXISTS default.coverage_map
(
  hash     String,
  statement_map   Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map      Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  restore_statement_map   Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  restore_fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  restore_branch_map      Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  ts              DateTime
  ) ENGINE = ReplacingMergeTree()
  PARTITION BY toYYYYMM(ts)
  ORDER BY (hash)
  TTL ts + toIntervalHour(720)
  SETTINGS index_granularity = 8192;


-- 聚合表 coverage_hit_agg

CREATE TABLE IF NOT EXISTS default.coverage_hit_agg
(
  coverage_id String,
  full_file_path   String,
  s       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  f       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  b       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  latest_ts   SimpleAggregateFunction(max, DateTime)
  )
  ENGINE = AggregatingMergeTree()
  PARTITION BY toYYYYMM(latest_ts)
  ORDER BY (coverage_id, full_file_path);

-- 物化视图

CREATE MATERIALIZED VIEW IF NOT EXISTS default.coverage_hit_mv
            TO default.coverage_hit_agg
AS
SELECT
  coverage_id,
  full_file_path,
  sumMapState(mapKeys(s), mapValues(s)) AS s,
  sumMapState(mapKeys(f), mapValues(f)) AS f,
  sumMapState(mapKeys(b), mapValues(b)) AS b,

  max(ts) AS latest_ts
FROM default.coverage_hit
GROUP BY coverage_id, full_file_path;

-- 查询

SELECT
  coverage_id,
  full_file_path,
  sumMapMerge(s) AS s,
  sumMapMerge(f) AS f
FROM default.coverage_hit_agg
GROUP BY coverage_id, full_file_path;

-- 问题
-- map表，聚合为一行的时候，应该是到build_provider、build_id维度，目前是到coverage_id,report_id维度，map_id，根据build
