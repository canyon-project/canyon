import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { generateCoverageId } from '../../../utils/generateCoverageId';
import { ClickHouseClient } from '@clickhouse/client';
import { CoverageQueryParams } from '../../../types/coverage';

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

    try {
      await this.prisma.coverage.create({
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
      });
    } catch () {}
    await this.insertCoverageToClickhouse(coverageID, coverage);
    return {
      msg: 'ok',
      coverageId: '',
      dataFormatAndCheckTime: '',
      coverageInsertDbTime: '',
    };
  }

  async insertCoverageToClickhouse(
    coverageID: string,
    params: CoverageQueryParams,
  ) {
    // TODO: 实现实际的数据库查询逻辑
    // const params = coverage;
    if (
      Object.values(params).length > 0 &&
      Object.values(params)[0].branchMap
    ) {
      //   才需要插入map表
      await this.clickhouseClient.insert({
        table: 'coverage_map',
        values: Object.values(params).map(
          ({ statementMap, path, branchMap, fnMap, inputSourceMap }) => {
            return {
              ts: Math.floor(new Date().getTime() / 1000),
              coverage_id: coverageID,
              file_path: path,
              input_source_map: inputSourceMap
                ? JSON.stringify(inputSourceMap)
                : '',
              statement_map: Object.fromEntries(
                Object.entries(statementMap).map(([k, v]) => [
                  Number(k),
                  [[v.start.line, v.start.column, v.end.line, v.end.column]],
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
                    v.type,
                    v.line,
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
          },
        ),
        format: 'JSONEachRow',
      });
    }

    await this.clickhouseClient.insert({
      table: 'coverage_hit',
      values: Object.values(params).map(({ s, path, f, b }) => {
        return {
          ts: Math.floor(new Date().getTime() / 1000),
          coverage_id: coverageID,
          file_path: path,
          s: s,
          f: f,
          b: b,
        };
      }),
      format: 'JSONEachRow',
    });
  }
}
