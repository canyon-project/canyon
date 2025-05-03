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

    const mapList = Object.values(coverage as CoverageQueryParams)
      .filter(
        ({ statementMap, branchMap, fnMap }) =>
          statementMap && branchMap && fnMap,
      )
      .map(({ statementMap, branchMap, fnMap, inputSourceMap, path }) => {
        const source_map_hash_id = inputSourceMap
          ? createHash('sha256')
              .update(JSON.stringify(inputSourceMap))
              .digest('hex')
          : '';

        const mapItem = {
          relative_path: path,
          source_map_hash_id: source_map_hash_id,
          source_map: JSON.stringify(inputSourceMap),
          statement_map: Object.fromEntries(
            Object.entries(statementMap).map(([k, v]) => [
              Number(k),
              [v.start.line, v.start.column, v.end.line, v.end.column],
            ]),
          ),
          fn_map: Object.fromEntries(
            Object.entries(fnMap).map(([k, v]) => [
              Number(k),
              [
                v.name,
                v.line,
                [
                  v.decl.start.line,
                  v.decl.start.column,
                  v.decl.end.line,
                  v.decl.end.column,
                ],
                [
                  v.loc.start.line,
                  v.loc.start.column,
                  v.loc.end.line,
                  v.loc.end.column,
                ],
              ],
            ]),
          ),
          branch_map: Object.fromEntries(
            Object.entries(branchMap).map(([k, v]) => [
              Number(k),
              [
                getBranchTypeIndex(v.type),
                v.line,
                [
                  v.loc.start.line,
                  v.loc.start.column,
                  v.loc.end.line,
                  v.loc.end.column,
                ],
                v.locations.map((loc) => [
                  loc.start.line,
                  loc.start.column,
                  loc.end.line,
                  loc.end.column,
                ]),
              ],
            ]),
          ),
        };

        const file_coverage_map_hash = createHash('sha256')
          .update(
            JSON.stringify({
              // input_source_map: mapItem.input_source_map, 把input_source_map移到relation表
              statement_map: mapItem.statement_map,
              fn_map: mapItem.fn_map,
              branch_map: mapItem.branch_map,
            }),
          )
          .digest('hex');

        return {
          ...mapItem,
          file_coverage_map_hash, // 增加hash字段
        };
      });

    // const compressed = inputSourceMap
    //   ? gzipSync(Buffer.from())
    //   : null;
    //

    // .map((m) => ({
    //     hash: m.source_map_hash_id,
    //     sourceMap: m.source_map,
    //   }))

    await this.prisma.coverageSourceMap.createMany({
      data: mapList
        .filter((i) => i.source_map_hash_id)
        .map((i) => {
          return {
            hash: i.source_map_hash_id,
            sourceMap: gzipSync(Buffer.from(i.source_map)),
          };
        }),
      skipDuplicates: true,
    });

    // 1. 先检查有没有 （不知道能不能这是个经典的「幂等写入 vs 唯一约束」问题）
    // coverageMapRelationList是已经插入过的
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          hashID: {
            in: mapList.map((i) => i.file_coverage_map_hash),
          },
        },
      });

    // coverageMapRelationList 是已存在的 hash
    const existingHashSet = new Set(
      coverageMapRelationList.map((r) => r.hashID),
    );

    // 找出未存在的 mapList 项
    const newMapList = mapList.filter(
      (item) => !existingHashSet.has(item.file_coverage_map_hash),
    );

    // 插入 coverage_map 表（只插入新的 map 内容）
    // await this.prisma.coverageMap.createMany({
    //   data: newMapList.map((m) => ({
    //     hashID: m.hash,
    //     inputSourceMap: m.input_source_map,
    //     statementMap: m.statement_map,
    //     fnMap: m.fn_map,
    //     branchMap: m.branch_map,
    //   })),
    //   skipDuplicates: true, // 避免并发情况下报错
    // });

    //   才需要插入map表
    await this.clickhouseClient.insert({
      table: 'coverage_map',
      values: newMapList.map((m) => ({
        ts: Math.floor(new Date().getTime() / 1000),
        hash: m.file_coverage_map_hash,
        // input_source_map: m.input_source_map,
        statement_map: m.statement_map,
        fn_map: m.fn_map,
        branch_map: m.branch_map,
      })),
      format: 'JSONEachRow',
    });

    // const sourceMapHashID = '';

    // 插入 coverage_map_relation 表（当前 coverageID 所关联的 hash）
    await this.prisma.coverageMapRelation.createMany({
      data: mapList.map((m) => ({
        id: coverageID + '|' + m.relative_path,
        hashID: m.file_coverage_map_hash,
        absolutePath: m.relative_path,
        relativePath: m.relative_path,
        coverageID,
        sourceMapHashID: m.source_map_hash_id,
        // inputSourceMap: m.input_source_map,
      })),
      skipDuplicates: true,
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

    // 这里返回插入的状态，例如成功几个，失败几个
    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }
}
