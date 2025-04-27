CREATE TABLE IF NOT EXISTS default.coverage_hit
(
  coverage_id     String,
  relative_path       String,
  s               Map(UInt32, UInt32),
  f               Map(UInt32, UInt32),
  b               Map(UInt32, UInt32),
  ts              DateTime
  ) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(ts)
  ORDER BY (ts)
  TTL ts + toIntervalHour(720);
-- ReplacingMergeTree

CREATE TABLE IF NOT EXISTS default.coverage_map
(
  hash     String,
  statement_map   Map(UInt32, Tuple(UInt32, UInt32, UInt32, UInt32)),
  fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map      Map(UInt32, Tuple(UInt8, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  input_source_map String,
  ts              DateTime
  ) ENGINE = ReplacingMergeTree()
  PARTITION BY toYYYYMM(ts)
  ORDER BY (hash)
  TTL ts + toIntervalHour(720)
  SETTINGS index_granularity = 8192;


-- 聚合表 coverage_hit_agg

CREATE TABLE IF NOT EXISTS default.coverage_hit_agg
(
  hash String,
  relative_path   String,
  s_map       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  f_map       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  b_map       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  latest_ts   SimpleAggregateFunction(max, DateTime)
  )
  ENGINE = AggregatingMergeTree()
  PARTITION BY tuple()
  ORDER BY (hash, relative_path);

-- 物化视图

CREATE MATERIALIZED VIEW default.coverage_hit_mv
            TO default.coverage_hit_agg
AS
SELECT
  hash,
  relative_path,
  sumMapState(mapKeys(s), mapValues(s)) AS s_map,
  sumMapState(mapKeys(f), mapValues(f)) AS f_map,
  sumMapState(mapKeys(b), mapValues(b)) AS b_map,

  max(ts) AS latest_ts
FROM default.coverage_hit
GROUP BY hash, relative_path;

-- 查询

-- SELECT
--   hash,
--   relative_path,
--   sumMapMerge(s_map) AS merged_s,
--   sumMapMerge(f_map) AS merged_f,
--   last_updated
-- FROM default.coverage_hit_agg
-- GROUP BY hash, relative_path;

-- 问题
-- map表，聚合为一行的时候，应该是到build_provider、build_id维度，目前是到coverage_id,report_id维度，map_id，根据build
