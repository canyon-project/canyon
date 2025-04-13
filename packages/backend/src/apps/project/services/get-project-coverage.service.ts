import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClickHouseClient } from '@clickhouse/client';
import {dbToIstanbul} from "../../../utils/dbToIstanbul";
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

    const coverage_id =
      'cb60c1425ea9a141522ea8bfa946338ea8d76b53a4cd9f0c7af576ef238f4f17';
    const queryS = `
      SELECT * FROM coverage_map WHERE coverage_id='${coverage_id}';
    `;

    const resultS = await this.clickhouseClient.query({
      query: queryS,
      format: 'JSONEachRow',
    });
    const dataS = await resultS.json();

    const queryF = `SELECT
    coverage_id,
    file_path,
    sumMapMerge(s_map) AS merged_s,
    sumMapMerge(f_map) AS merged_f
FROM default.coverage_hit_agg
WHERE coverage_id='${coverage_id}'
GROUP BY coverage_id, file_path;`;

    const resultF = await this.clickhouseClient.query({
      query: queryF,
      format: 'JSONEachRow',
    });
    const dataF = await resultF.json();

    return dbToIstanbul(dataS)
  }
}
