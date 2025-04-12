CREATE TABLE IF NOT EXISTS default.coverage_hit
(
  coverage_id     String,
  file_path       String,
  s               Map(UInt32, UInt32),
  f               Map(UInt32, UInt32),
  b               Map(UInt32, Array(UInt32)),
  ts              DateTime
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/ck100062136-{shard}/default/coverage_hit', '{replica}')
    PARTITION BY toYYYYMM(ts)
    ORDER BY (ts)
    TTL ts + toIntervalHour(720);


CREATE TABLE IF NOT EXISTS default.coverage_map
(
  coverage_id     String,
  file_path       String,
  statement_map   Map(UInt32, Tuple(Tuple(UInt32, UInt32, UInt32, UInt32))),
  fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map      Map(UInt32, Tuple(String, UInt32, Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  ts              DateTime
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/ck100062136-{shard}/default/coverage_map', '{replica}')
    PARTITION BY toYYYYMM(ts)
    ORDER BY (ts)
    TTL ts + toIntervalHour(720);


-- ReplacingMergeTree

CREATE TABLE IF NOT EXISTS default.coverage_map
(
  coverage_id     String,
  file_path       String,
  statement_map   Map(UInt32, Tuple(Tuple(UInt32, UInt32, UInt32, UInt32))),
  fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map      Map(UInt32, Tuple(String, UInt32, Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  input_source_map String,
  ts              DateTime
  ) ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/ck100062136-{shard}/default/coverage_map', '{replica}')
  PARTITION BY toYYYYMM(ts)
  ORDER BY (coverage_id, file_path)
  TTL ts + toIntervalHour(720)
  SETTINGS index_granularity = 8192;


-- 聚合表 coverage_hit_agg

CREATE TABLE IF NOT EXISTS default.coverage_hit_agg
(
  coverage_id String,
  file_path   String,
  s_map       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  f_map       AggregateFunction(sumMap, Array(UInt32), Array(UInt32)),
  latest_ts   SimpleAggregateFunction(max, DateTime)
  )
  ENGINE = AggregatingMergeTree()
  PARTITION BY tuple()
  ORDER BY (coverage_id, file_path);

-- 物化视图

CREATE MATERIALIZED VIEW default.coverage_hit_mv
            TO default.coverage_hit_agg
AS
SELECT
  coverage_id,
  file_path,
  sumMapState(mapKeys(s), mapValues(s)) AS s_map,
  sumMapState(mapKeys(f), mapValues(f)) AS f_map,
  max(ts) AS latest_ts
FROM default.coverage_hit
GROUP BY coverage_id, file_path;

-- 查询

SELECT
  coverage_id,
  file_path,
  sumMapMerge(s_map) AS merged_s,
  sumMapMerge(f_map) AS merged_f,
  last_updated
FROM default.coverage_hit_agg
GROUP BY coverage_id, file_path;
