import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { coverageMapQuerySql } from '../../sql/coverage-map-query.sql';
import { coverageHitQuerySql } from '../../sql/coverage-hit-query.sql';
import {
  CoverageHitQuerySqlResultJsonInterface,
  CoverageMapQuerySqlResultJsonInterface,
} from '../../types/coverage-final.types';
import {
  transformCkToCoverageBranchMap,
  transformCkToCoverageFnMap,
  transformCkToCoverageStatementMap, transformClickHouseCoverageHitToIstanbul,
} from '../../../../utils/transform';
import { restructureCoverageData } from '../../helpers/coverage';
import {removeCoverageInstrumentCwd} from "../../../../utils/removeCoverageInstrumentCwd";

@Injectable()
export class CoverageFinalService {
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
    const coverageList = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });
    // 第二步：provider、repoID、sha、buildProvider、buildID确定一组 coverage_map
    // NOTE：这里 coverageID 没加索引，查询速度可能会比较慢，会达到3s TODO
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.groupBy({
        by: ['coverageMapHashID', 'fullFilePath'],
        where: {
          coverageID: {
            in: coverageList.map(({id}) => id),
          },
          filePath: filePath,
        },
      });

    // 第三步：查询 ClickHouse
    const [coverageMapQuerySqlResultJson,coverageHitQuerySqlResultJson] = await Promise.all([
      this.clickhouseClient.query({
        query: coverageMapQuerySql(coverageMapRelationList.map(({coverageMapHashID})=>coverageMapHashID)),
        format: 'JSONEachRow',
      }).then(r=>r.json()),
      this.clickhouseClient.query({
        query: coverageHitQuerySql(coverageList,{
          reportProvider,
          reportID,
        }),
        format: 'JSONEachRow',
      }).then(r=>r.json<CoverageHitQuerySqlResultJsonInterface>())
    ])

    const coverageMapQuerySqlResultJsonWithFilePath:(CoverageMapQuerySqlResultJsonInterface & {
      fullFilePath: string;
    })[] = []
    // 把 coverageMapQuerySqlResultJson 的每一项添加 fullFilePath
    for (let i = 0; i < coverageMapQuerySqlResultJson.length; i++) {
      const item = coverageMapQuerySqlResultJson[i] as CoverageMapQuerySqlResultJsonInterface;
      const fullFilePath = coverageMapRelationList.find(
        ({coverageMapHashID}) => coverageMapHashID === item.coverageMapHashID,
      )?.fullFilePath;
      if (fullFilePath) {
        coverageMapQuerySqlResultJsonWithFilePath.push({
          ...item,
          fullFilePath: fullFilePath||'',
        });
      }
    }


    const result = this.mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
      coverageMapQuerySqlResultJsonWithFilePath,
      coverageHitQuerySqlResultJson)

    const instrumentCwd = coverageList[0].instrumentCwd;

    return removeCoverageInstrumentCwd(result, instrumentCwd)
  }


  //   合并 coverageMapQuerySqlResult、coverageHitQuerySqlResult
  mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
    coverageMapQuerySqlResultJsonWithFilePath: (CoverageMapQuerySqlResultJsonInterface & {
      fullFilePath: string;
    })[],
    coverageHitQuerySqlResultJson: CoverageHitQuerySqlResultJsonInterface[],
  ) {
    // 以 coverageMapQuerySqlResultJsonWithFilePath 为基，合并覆盖率数据！
    // convertClickHouseCoverageToIstanbul
    const result = {};
    coverageMapQuerySqlResultJsonWithFilePath.forEach((item) => {
      const fileCoverageItem = {
        path: item.fullFilePath,
        statementMap: transformCkToCoverageStatementMap(item.statementMap),
        fnMap: transformCkToCoverageFnMap(item.fnMap),
        branchMap: transformCkToCoverageBranchMap(item.branchMap),
      };
      const fileCoverageItemWidthHit = {
        path: item.fullFilePath,
        ...transformClickHouseCoverageHitToIstanbul(coverageHitQuerySqlResultJson.find(j=>j.fullFilePath===item.fullFilePath))
      }
      result[item.fullFilePath] = restructureCoverageData(
        fileCoverageItemWidthHit,
        fileCoverageItem,
      )
    });
    return result;
  }
}
