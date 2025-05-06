SELECT statement_map as statementMap,branch_map as branchMap,hash as coverageMapHashID
FROM coverage_map LIMIT 10;

SELECT
  coverage_id,
  relative_path,
  sumMapMerge(s_map) AS s,
  sumMapMerge(f_map) AS f,
  sumMapMerge(b_map) AS b
FROM default.coverage_hit_agg
WHERE coverage_id IN ('550617f768cb0b86a31c77815a44fb5a39573177206335a17ade36cf85a52463')
GROUP BY coverage_id, relative_path;

-- 需要把

-- 以下是pg的sql，通过groupBy减少一次过滤

select relative_path,source_map_hash_id,hash_id from canyonjs_coverage_map_relation where coverage_id in ('55df37764e04ab9ecdbb2522c3602652a96be75621cdec664620750322b080a2',
                                                                                                          '7a959e847376b70ac2dad4e734d2bdd3cd192f63074194494128682d4dbafc7f')
group by relative_path,source_map_hash_id,hash_id;

-- 尝试是否可以一个sql查所有
-- 尝试ts封装一些转换函数，ckToistanbul，istanbulToCk
