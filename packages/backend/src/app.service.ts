import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class AppService {
  constructor(
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}

  async getHello(): Promise<{
    [filePath: string]: {
      s: { [sIndex: string]: number };
      f: { [fIndex: string]: number };
    };
  }> {
    const sha = '1053f12ad516b609ec1e05bb013a4cd25947a873';
    const queryS = `
      SELECT
        file_path,
        arrayJoin(mapKeys(s)) AS s_index,
        sum(s[s_index]) AS s_hit
      FROM coverage_hit_agg
      WHERE sha = '${sha}'
      GROUP BY file_path, s_index
      ORDER BY file_path, s_index;
    `;

    const resultS = await this.clickhouseClient.query({
      query: queryS,
      format: 'JSONEachRow',
    });
    const dataS = await resultS.json();

    const queryF = `
      SELECT
        file_path,
        arrayJoin(mapKeys(f)) AS f_index,
        sum(f[f_index]) AS f_hit
      FROM coverage_hit
      WHERE sha = '${sha}'
      GROUP BY file_path, f_index
      ORDER BY file_path, f_index;
    `;

    const resultF = await this.clickhouseClient.query({
      query: queryF,
      format: 'JSONEachRow',
    });
    const dataF = await resultF.json();

    const combinedResult: {
      [filePath: string]: {
        s: { [sIndex: string]: number };
        f: { [fIndex: string]: number };
      };
    } = {};

    dataS.forEach((item) => {
      const { file_path, s_index, s_hit } = item as {
        file_path: string;
        s_index: string;
        s_hit: number;
      };
      if (!combinedResult[file_path]) {
        combinedResult[file_path] = { s: {}, f: {} };
      }
      combinedResult[file_path].s[s_index] = s_hit;
    });

    dataF.forEach((item) => {
      const { file_path, f_index, f_hit } = item as {
        file_path: string;
        f_index: string;
        f_hit: number;
      };
      if (!combinedResult[file_path]) {
        combinedResult[file_path] = { s: {}, f: {} };
      }
      combinedResult[file_path].f[f_index] = f_hit;
    });

    return combinedResult;
  }
}
