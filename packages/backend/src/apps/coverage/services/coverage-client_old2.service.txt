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

    await this.prisma.coverage
      .create({
        data: {
          // needSourceMapBacktrack:false,
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

    // 还原覆盖率
    const remapCoverageObject = await remapCoverageByOld(coverage);

    const newMapList: any[] = [];
    Object.entries(coverage).forEach(([key, value]: any) => {
      const newCoverage: any = Object.values(remapCoverageObject).find(
        ({ oldPath }) => {
          // console.log(i, key)
          return oldPath === key;
        },
      );
      // 通过 value 中的sourceMap来判断是否要插入no_transform的数据
      if (newCoverage) {
        // value.inputSourceMap;
        const inputSourceMaphash = transFormHash(value.inputSourceMap);
        const sourceMap = gzipSync(
          Buffer.from(JSON.stringify(value.inputSourceMap)),
        );
        this.prisma.coverageSourceMap.create({
          data: {
            hash: inputSourceMaphash,
            sourceMap,
          },
        });

        const file_coverage_map_hash = transFormHash({
          statement_map: newCoverage.statementMap,
          fn_map: newCoverage.fnMap,
          branch_map: newCoverage.branchMap,
        });

        newMapList.push({
          file_coverage_map_hash: file_coverage_map_hash,
          statement_map: transformCoverageStatementMapToCk(
            newCoverage.statementMap,
          ),
          fn_map: transformCoverageFnMapToCk(newCoverage.fnMap),
          branch_map: transformCoverageBranchMapToCk(newCoverage.branchMap),
          no_transform_statement_map: transformCoverageStatementMapToCk(
            value.statementMap,
          ),
          no_transform_fn_map: transformCoverageFnMapToCk(value.fnMap),
          no_transform_branch_map: transformCoverageBranchMapToCk(
            value.branchMap,
          ),
          source_map_hash_id:inputSourceMaphash,
          path: newCoverage.path,
        });
      }
    });
    const willInsertMapList = [newMapList[0]].map((m) => ({
      ts: Math.floor(new Date().getTime() / 1000),
      hash: m.file_coverage_map_hash,
      statement_map: m.statement_map,
      fn_map: m.fn_map,
      branch_map: m.branch_map,
      no_transform_statement_map: m.no_transform_statement_map,
      no_transform_fn_map: m.no_transform_fn_map,
      no_transform_branch_map: m.no_transform_branch_map,
      relative_path: m.path,
      source_map_hash_id: m.source_map_hash_id,
    }));
    await this.clickhouseClient.insert({
      table: 'coverage_map',
      values: willInsertMapList,
      format: 'JSONEachRow',
    });

    await this.clickhouseClient.insert({
      table: 'coverage_hit',
      values: Object.values(coverage as CoverageQueryParams).map(
        ({ s, path, f, b }) => {
          return {
            ts: Math.floor(new Date().getTime() / 1000),
            coverage_id: coverageID, // 这里的hash_id是 coverageID，保证reportID维度的不重复
            relative_path: path,
            s: s,
            f: f,
            b: flattenBranchMap(b),
          };
        },
      ),
      format: 'JSONEachRow',
    });

    // 插入 coverage_map_relation 表（当前 coverageID 所关联的 hash）
    await this.prisma.coverageMapRelation.createMany({
      data: willInsertMapList.map((m) => ({
        id: coverageID + '|' + m.relative_path,
        hashID: m.hash,
        absolutePath: m.relative_path,
        relativePath: m.relative_path,
        coverageID,
        sourceMapHashID: m.source_map_hash_id,
        // inputSourceMap: m.input_source_map,
      })),
      skipDuplicates: true,
    });

    // 这里返回插入的状态，例如成功几个，失败几个
    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }
}
