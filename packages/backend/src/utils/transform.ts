// @ts-nocheck
import { getBranchTypeByIndex, getBranchTypeIndex } from './getBranchType';
import zlib from 'zlib';
export const transformCoverageStatementMapToCk = (statementMap) => {
  return Object.fromEntries(
    Object.entries(statementMap).map(([k, v]) => [
      Number(k),
      [v.start.line, v.start.column, v.end.line, v.end.column],
    ]),
  );
};

export const transformCoverageFnMapToCk = (fnMap) => {
  return Object.fromEntries(
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
  );
};

export const transformCoverageBranchMapToCk = (branchMap) => {
  return Object.fromEntries(
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
  );
};

export const transformCkToCoverageStatementMap = (statement_map) =>
  Object.entries(statement_map).reduce(
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
  );
export const transformCkToCoverageBranchMap = (branch_map) =>
  Object.entries(branch_map).reduce(
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
          ([startLine, startColumn, endLine, endColumn]) => {
            if ([startLine, startColumn, endLine, endColumn].includes(0)) {
              return {
                start: {},
                end: {},
              };
            }
            return {
              start: {
                line: startLine,
                column: startColumn,
              },
              end: {
                line: endLine,
                column: endColumn,
              },
            };
          },
        ),
      };
      return acc;
    },
    {},
  );

export function decodeCompressedObject(compressedBuffer) {
  try {
    // 解压缩
    const decompressedBuffer = zlib.gunzipSync(compressedBuffer);
    // 将解压缩后的 Buffer 转换为字符串
    const jsonString = decompressedBuffer.toString();
    // 解析字符串为 JavaScript 对象
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('解码过程中出现错误:', error);
    return null;
  }
}

export function encodeObjectToCompressedBuffer(object) {
  // 将对象转换为字符串
  const jsonString = JSON.stringify(object);
  // 将字符串转换为 Buffer
  const buffer = Buffer.from(jsonString, 'utf-8');
  // 压缩 Buffer
  const compressedBuffer = zlib.gzipSync(buffer);
  return compressedBuffer;
}
