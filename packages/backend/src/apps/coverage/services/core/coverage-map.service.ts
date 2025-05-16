import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ClickHouseClient } from '@clickhouse/client';
import { coverageMapQuerySql } from '../../sql/coverage-map-query.sql';
import { CoverageMapQuerySqlResultJsonInterface } from '../../types/coverage-final.types';
import {
  transformCkToCoverageBranchMap,
  transformCkToCoverageFnMap,
  transformCkToCoverageStatementMap,
} from '../../../../utils/transform';

@Injectable()
export class CoverageMapService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}

  async invoke(
    provider: string,
    repoID: string,
    sha: string,
    buildProvider?: string,
    buildID?: string,
    reportProvider?: string,
    reportID?: string,
    filePath?: string,
  ) {
    // 第一步：查询coverage表，获取所有的 coverageID。注意，此时不过滤reportProvider和reportID，这一步很关键，因为我们需要获取到所有的文件内容
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });
    // TODO coverage_map_relation 表的优化空间是source_map的重复，reportID相同时会重复存
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.groupBy({
        by: ['coverageMapHashID', 'fullFilePath'],
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
          filePath: filePath,
        },
      });
    const deduplicateHashIDList = coverageMapRelationList.map(
      (i) => i.coverageMapHashID,
    );
    const coverageMapQuerySqlResultJson = await this.clickhouseClient
      .query({
        query: coverageMapQuerySql(deduplicateHashIDList),
        format: 'JSONEachRow',
      })
      .then((r) => r.json<CoverageMapQuerySqlResultJsonInterface>());

    const coverageMapQuerySqlResultJsonWithfilePath =
      coverageMapRelationList.map((i) => {
        const sss = coverageMapQuerySqlResultJson.find(
          (j) => j.coverageMapHashID === i.coverageMapHashID,
        );
        return {
          ...sss,
          fullFilePath: i.fullFilePath,
        };
      });

    const obj = {};
    for (let i = 0; i < coverageMapQuerySqlResultJsonWithfilePath.length; i++) {
      const { fnMap, statementMap, branchMap, fullFilePath } =
        coverageMapQuerySqlResultJsonWithfilePath[i];
      const fileCoverageItem = {
        path: fullFilePath,
        statementMap: transformCkToCoverageStatementMap(statementMap),
        fnMap: transformCkToCoverageFnMap(fnMap),
        branchMap: transformCkToCoverageBranchMap(branchMap),
      };
      obj[fullFilePath] = fileCoverageItem;
    }

    return obj;
  }
}
