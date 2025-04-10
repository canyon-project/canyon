CREATE TABLE IF NOT EXISTS default.coverage_hit
(
  instrument_cwd  String,
  provider        String,
  repo_id         String,
  sha             String,
  branch          String,
  build_provider  String,
  build_id        String,
  report_provider String,
  report_id       String,
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
  instrument_cwd  String,
  provider        String,
  repo_id         String,
  sha             String,
  branch          String,
  build_provider  String,
  build_id        String,
  report_provider String,
  report_id       String,
  file_path       String,
  statement_map   Map(UInt32, Tuple(Tuple(UInt32, UInt32, UInt32, UInt32))),
  fn_map          Map(UInt32, Tuple(String, UInt32, Tuple(UInt32, UInt32, UInt32, UInt32), Tuple(UInt32, UInt32, UInt32, UInt32))),
  branch_map      Map(UInt32, Tuple(String, UInt32, Array(Tuple(UInt32, UInt32, UInt32, UInt32)))),
  ts              DateTime
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/ck100062136-{shard}/default/coverage_map', '{replica}')
    PARTITION BY toYYYYMM(ts)
    ORDER BY (ts)
    TTL ts + toIntervalHour(720);
