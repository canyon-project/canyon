import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClickHouseClient } from '@clickhouse/client';
import { dbToIstanbul } from '../../../utils/dbToIstanbul';
// import { PrismaService } from '../../prisma/prisma.service';
// import { within30days } from '../../utils/utils';
// import { percent } from 'canyon-data';
// import * as dayjs from 'dayjs';

@Injectable()
export class GetProjectCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(provider, repoID, sha, buildProvider, buildID) {
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });

    // 一批coverageIDs，多个reportID，里面关联的所有path都要

    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
        },
      });

    // coverageMapRelationList去重hash，把所有相关的查出来

    const hashs = coverageMapRelationList.map(
      (coverageMapRelation) => coverageMapRelation.hashID,
    );

    const sethashs = [...new Set(hashs)];

    // console.log(sethashs,'sethashs')

    const queryS = `
  SELECT *
  FROM coverage_map
  WHERE hash IN (${sethashs.map((h) => `'${h}'`).join(', ')});
`;

    const resultS = await this.clickhouseClient.query({
      query: queryS,
      format: 'JSONEachRow',
    });
    const dataS = await resultS.json();

    return dbToIstanbul(dataS);
  }
}

// const queryF = `SELECT
//     hash,
//     relative_path,
//     sumMapMerge(s_map) AS merged_s,
//     sumMapMerge(f_map) AS merged_f
// FROM default.coverage_hit_agg
// WHERE hash='${hash}'
// GROUP BY hash, relative_path;`;
//
// const resultF = await this.clickhouseClient.query({
//   query: queryF,
//   format: 'JSONEachRow',
// });
// const dataF = await resultF.json();
