// @ts-nocheck
import { getBranchTypeByIndex } from './getBranchType';

export function dbToIstanbul(cov_map) {
  const result = {};

  cov_map.forEach((item) => {
    result[item.relative_path] = {
      path: item.relative_path,
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
          console.log(locations);
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
  });
  return result;
}
