// @ts-nocheck
import { getBranchTypeByIndex } from './getBranchType';
import { genHitByMap } from './genHitByMap';
import { decodeKey } from './ekey';

export function dbToIstanbul(coverageMapQuerySqlResultJson, coverageHitQuerySqlResultJson) {
  console.log(coverageMapQuerySqlResultJson)
  const result = {};

  coverageMapQuerySqlResultJson.forEach((item) => {
    const beigin = {
      path: item.relative_path,
      // s: coverageHitQuerySqlResultJson.find((i) => i.relative_path === item.relative_path).merged_s,
      statementMap: Object.entries(item.statement_map).reduce(
        (acc, [key, [startLine, startColumn, endLine, endColumn]]) => {
          acc[key] = {
            start: {
              line: startLine,
              column: startColumn,
            },
            end: {
              line: endLine,
              column: endColumn,
            },
          };
          return acc;
        },
        {},
      ),
      fnMap: Object.entries(item.fn_map).reduce(
        (
          acc,
          [
            key,
            [
              name,
              line,
              [startLine, startColumn, endLine, endColumn],
              [startLine2, startColumn2, endLine2, endColumn2],
            ],
          ],
        ) => {
          acc[key] = {
            name,
            line,
            decl: {
              start: {
                line: startLine,
                column: startColumn,
              },
              end: {
                line: endLine,
                column: endColumn,
              },
            },
            loc: {
              start: {
                line: startLine2,
                column: startColumn2,
              },
              end: {
                line: endLine2,
                column: endColumn2,
              },
            },
          };
          return acc;
        },
        {},
      ),
      branchMap: Object.entries(item.branch_map).reduce(
        (acc, [key, [type, line, loc, locations]]) => {
          acc[key] = {
            type: getBranchTypeByIndex(type),
            line,
            loc: {
              start: {
                line: loc[0],
                column: loc[1],
              },
              end: {
                line: loc[2],
                column: loc[3],
              },
            },
            locations: locations.map(
              ([startLine, startColumn, endLine, endColumn]) => ({
                start: {
                  line: startLine,
                  column: startColumn,
                },
                end: {
                  line: endLine,
                  column: endColumn,
                },
              }),
            ),
          };
          return acc;
        },
        {},
      ),
      inputSourceMap: item.input_source_map
        ? JSON.parse(item.input_source_map)
        : undefined,
    };

    const initCov = genHitByMap(beigin);

    const { merged_s, merged_f, merged_b } = coverageHitQuerySqlResultJson.find(
      (i) => i.relative_path === item.relative_path,
    );

    merged_s[0].forEach((j, jindex) => {
      initCov.s[j] = Number(merged_s[1][jindex]);
    });

    merged_f[0].forEach((j, jindex) => {
      initCov.f[j] = Number(merged_f[1][jindex]);
    });

    // console.log(merged_b[0],'merged_b[0]')

    merged_b[0].forEach((j, jindex) => {
      const realB = decodeKey(j);
      const [a, b] = realB;
      initCov.b[a][b] = Number(merged_b[1][jindex]);
    });

    result[item.relative_path] = {
      ...beigin,
      ...initCov,
    };
  });
  return result;
}
