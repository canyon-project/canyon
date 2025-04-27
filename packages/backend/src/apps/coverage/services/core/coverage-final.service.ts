import { Inject, Injectable } from '@nestjs/common'
// import { PrismaService } from '../../../prisma/prisma.service';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { dbToIstanbul } from '../../../../utils/dbToIstanbul';
import { remapCoverageWithInstrumentCwd } from 'canyon-map';

@Injectable()
export class CoverageFinalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(provider, repoID, sha, buildProvider, buildID,
               reportProvider, reportID
               ) {

    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });

    // 查询 Postgres：哪些 hash 出现在哪些路径中
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
        },
      });

    // 构造 hash -> relative_paths[] 映射表
    const hashToPaths = new Map<string, string>();
    for (const item of coverageMapRelationList) {
      hashToPaths.set(item.hashID, item.relativePath);
    }

    // 查询 ClickHouse：查 hash 对应的 coverage_map
    const sethashs = [...new Set(coverageMapRelationList.map((i) => i.hashID))];

    const queryS = `
  SELECT *
  FROM coverage_map
  WHERE hash IN (${sethashs.map((h) => `'${h}'`).join(', ')});
`;

    const resultS = await this.clickhouseClient.query({
      query: queryS,
      format: 'JSONEachRow',
    });
    const rawData = await resultS.json(); // [{ hash: ..., statement_map: ..., ... }, ...]

    // 将 file_path 挂上去
    const dataWithPath = rawData.map((i: any) => {
      const file_path = hashToPaths.get(i.hash);
      return {
        ...i,
        relative_path: file_path,
      };
    });

    // 返回带 file_path 的数据，或者传给 dbToIstanbul

    const queryF = `SELECT
                      coverage_id,
    relative_path,
    sumMapMerge(s_map) AS merged_s,
    sumMapMerge(f_map) AS merged_f,
    sumMapMerge(b_map) AS merged_b
FROM default.coverage_hit_agg
                    WHERE coverage_id IN (${coverages.map((h) => `'${h.id}'`).join(', ')})
GROUP BY coverage_id, relative_path;`;

    const resultF = await this.clickhouseClient.query({
      query: queryF,
      format: 'JSONEachRow',
    });
    const dataF = await resultF.json();

    const unReMapedCov = dbToIstanbul(dataWithPath, dataF);

    // 不知道要不要reMap
    // const realResCov = await remapCoverageWithInstrumentCwd(
    //   unReMapedCov,
    //   coverages[0].instrumentCwd,
    // );
    // console.log(coverages[0].instrumentCwd);
    const instrumentCwd = coverages[0].instrumentCwd;
    const realResCov = Object.values(unReMapedCov)
      .map((item: any) => {
        const path = item.path.replace(instrumentCwd + '/', '');
        return {
          ...item,
          path,
        };
      })
      .reduce((acc, cur) => {
        acc[cur.path] = cur;
        return acc;
      }, {});

    return realResCov;
  }
}
