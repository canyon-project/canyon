delete from canyon_next_coverage;
delete from canyon_next_coverage_hit;
delete from canyon_next_coverage_map;
delete from canyon_next_coverage_map_relation;
delete from canyon_next_coverage_source_map;

SELECT * from canyon_next_coverage WHERE scene ->> 'key1' = 'value1'
