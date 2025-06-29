// @ts-nocheck
import { getBranchTypeByIndex } from './getBranchType';

export const transformCkToCoverageStatementMap = (statement_map) =>
  Object.entries(statement_map).reduce(
    (acc, [key, [startLine, startColumn, endLine, endColumn]]) => {
      // 可能是null
      acc[key] = {
        start: {
          line: startLine || null,
          column: startColumn || null,
        },
        end: {
          line: endLine || null,
          column: endColumn || null,
        },
      };
      return acc;
    },
    {},
  );

export const transformCkToCoverageFnMap = (fn_map) =>
  Object.entries(fn_map).reduce(
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
        line: line || null,
        decl: {
          start: {
            line: startLine || null,
            column: startColumn || null,
          },
          end: {
            line: endLine || null,
            column: endColumn || null,
          },
        },
        loc: {
          start: {
            line: startLine2 || null,
            column: startColumn2 || null,
          },
          end: {
            line: endLine2 || null,
            column: endColumn2 || null,
          },
        },
      };
      return acc;
    },
    {},
  );

export const transformCkToCoverageBranchMap = (branch_map) =>
  Object.entries(branch_map).reduce(
    (acc, [key, [type, line, loc, locations]]) => {
      acc[key] = {
        type: getBranchTypeByIndex(type),
        line: line || null,
        loc: {
          start: {
            line: loc[0] || null,
            column: loc[1] || null,
          },
          end: {
            line: loc[2] || null,
            column: loc[3] || null,
          },
        },
        locations: locations.map(
          ([startLine, startColumn, endLine, endColumn]) => {
            return {
              start: {
                line: startLine || null,
                column: startColumn || null,
              },
              end: {
                line: endLine || null,
                column: endColumn || null,
              },
            };
          },
        ),
      };
      return acc;
    },
    {},
  );
