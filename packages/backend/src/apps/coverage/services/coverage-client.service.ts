import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { generateCoverageId } from '../../../utils/generateCoverageId';
import { ClickHouseClient } from '@clickhouse/client';
import { CoverageQueryParams } from '../../../types/coverage';
import {
  getBranchTypeByIndex,
  getBranchTypeIndex,
} from '../../../utils/getBranchType';
import { encodeKey, flattenBranchMap } from 'src/utils/ekey';
import { createHash } from 'crypto';
import { gzipSync } from 'zlib';
import { remapCoverageByOld } from 'canyon-map';
import * as fs from 'node:fs';
import {
  transformCoverageBranchMapToCk,
  transformCoverageFnMapToCk,
  transformCoverageStatementMapToCk,
} from '../../../utils/transform';
import { transFormHash } from '../../../utils/hash';
import { checkCoverageType } from '../../../utils/checkCoverageType';

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(
    reporter: string,
    {
      provider,
      sha,
      repoID,
      coverage,
      instrumentCwd,
      reportID, // 可选
      branch, // 可选
      compareTarget, //可选
      buildID, // 可选
      buildProvider, // 可选
      reportProvider, // 可选
    }: CoverageClientDto,
  ) {
    const coverageID = generateCoverageId({
      provider,
      sha,
      repoID,
      reportID,
      buildID,
      buildProvider,
      reportProvider,
    });

    // 1. 检查coverage类型
    const coverageType = checkCoverageType(coverage);

    const findCoverage = await this.prisma.coverage.findUnique({
      where: {
        id: coverageID,
      },
    });

    if (coverageType === 'hit' && findCoverage === null) {
      return {
        type: coverageType, // hit or map
        coverageTable: findCoverage,
      };
    }

    const isHas = await this.prisma.coverageMapRelation.count({
      where: {
        coverageID: coverageID,
      },
    });

    if (coverageType === 'hit') {
      // 有findCoverage，基本上肯定是有coverageMapRelation了
      // if (isHas > 0) {
      //   // 如果sourceMapID有，那就是最复杂的情况
      //   // 有hit且，且需要sm，且有，那就最复杂的情况
      // } else {
      //   // 说明没有sourceMap，要报错，不能用
      //   console.log('没有sourceMap');
      // }
    } else {
      //   如果是map的话，那逻辑就一样了
      const coverageID = generateCoverageId({
        provider,
        sha,
        repoID,
        reportID,
        buildID,
        buildProvider,
        reportProvider,
      });

      await this.prisma.coverage
        .create({
          data: {
            id: coverageID,
            sha, // 定
            repoID, // 定
            // coverage: {},
            instrumentCwd, // 定
            reportID: reportID,
            reportProvider: reportProvider,
            branch, // 定
            compareTarget,
            reporter: '1',
            buildID,
            buildProvider,
            scopeID: '2',
            provider: provider,
          },
        })
        .catch(() => {
          // console.log(r)
        });
    }
    return {
      type: coverageType, // hit or map
      coverageTable: findCoverage,
      isHas,
    };
  }
}
