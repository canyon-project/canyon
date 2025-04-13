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

    const hash_id =
      '3d24676eaa440203ba2e155039f9b809ce36fc384bf5ab49fbe69455c3374bdd';
    const queryS = `
      SELECT * FROM coverage_map WHERE hash_id='${hash_id}';
    `;

    const resultS = await this.clickhouseClient.query({
      query: queryS,
      format: 'JSONEachRow',
    });
    const dataS = await resultS.json();

    const queryF = `SELECT
    hash_id,
    relative_path,
    sumMapMerge(s_map) AS merged_s,
    sumMapMerge(f_map) AS merged_f
FROM default.coverage_hit_agg
WHERE hash_id='${hash_id}'
GROUP BY hash_id, relative_path;`;

    const resultF = await this.clickhouseClient.query({
      query: queryF,
      format: 'JSONEachRow',
    });
    const dataF = await resultF.json();

    return dbToIstanbul(dataS)
  }
}
