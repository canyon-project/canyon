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

    const findCoverage = await this.prisma.coverage.findUnique({
      where: {
        id: coverageID,
      },
    });

    // 如果是hit且需要sourceMap的话，看 CoverageMapRelation 里有没有数据，没得话需要报错

    // findCoverage.hasSourceMap = true; // 这里是为了测试用的，实际应该是从数据库中获取

    // 检查coverage类型，需要一个字段，看是否要进reMap逻辑

    // 没有map的话
    if (findCoverage?.buildID) {
      console.log('findCoverage', findCoverage.buildID);
    }

    // 第一步：插入 coverage 表，唯一。
    await this.prisma.coverage
      .create({
        data: {
          needSourceMapBacktrack: false,
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

    // 第二步：判断coverage类型

    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }
}
