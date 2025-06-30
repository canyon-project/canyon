import { getBranchTypeByIndex } from './getBranchType';
import {decodeKey} from "./ekey";

export const transformCkToCoverageStatementMap = (statement_map) =>
  Object.entries(statement_map).reduce(
    // @ts-ignore
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
        // @ts-ignore
        [
          // @ts-ignore
          name,
          // @ts-ignore
          line,
          // @ts-ignore
          [startLine, startColumn, endLine, endColumn],
          // @ts-ignore
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
    // @ts-ignore
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

function transform(h) {
  const indexList = h[0];
  const valueList = h[1];
  const o = {}
  for (let i = 0; i < indexList.length; i++) {
    o[indexList[i]] = Number(valueList[i]);
  }
  return o
}

function transformB(h) {
  const indexList = h[0];
  const valueList = h[1];
  const o = {}
  for (let i = 0; i < indexList.length; i++) {
    const [x,y] = decodeKey(indexList[i]);
    if (!o[x]) {
      o[x] = [];
    }
    o[x][y] = Number(valueList[i]);
  }
  return o
}

export const transformClickHouseCoverageHitToIstanbul = (hit) => {
  if (!hit){
    return {
      s: {},
      f: {},
      b: {},
    }
  }
  const { s, f, b } = hit;
  return {
    s: transform(s),
    f: transform(f),
    b: transformB(b)
  }
}
