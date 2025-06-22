// @ts-nocheck
import { getBranchTypeByIndex, getBranchTypeIndex } from './getBranchType';
import * as zlib from 'zlib';

function formartNum(num) {
  if (num) {
    if (num > 0 && num < 99999999) {
      return num;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/*NOTE:
 *
 * start、end可能为{}
 * line、column可能为null
 *
 * 注意单if场景，如果是单if，并且start、end完全相等，则没有else
 *
 * 观察此文件，看哪些还有可能是null，null在ck中一律为 0
 * */

export const transformCoverageStatementMapToCk = (statementMap) => {
  return Object.fromEntries(
    Object.entries(statementMap).map(([k, v]) => [
      Number(k),
      [
        formartNum(v.start.line),
        formartNum(v.start.column),
        formartNum(v.end.line),
        formartNum(v.end.column),
      ],
    ]),
  );
};

export const transformCoverageFnMapToCk = (fnMap) => {
  return Object.fromEntries(
    Object.entries(fnMap).map(([k, v]) => [
      Number(k),
      [
        v.name,
        formartNum(v.line),
        [
          formartNum(v.decl.start.line),
          formartNum(v.decl.start.column),
          formartNum(v.decl.end.line),
          formartNum(v.decl.end.column),
        ],
        [
          formartNum(v.loc.start.line),
          formartNum(v.loc.start.column),
          formartNum(v.loc.end.line),
          formartNum(v.loc.end.column),
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
        formartNum(v.line),
        [
          formartNum(v.loc.start.line),
          formartNum(v.loc.start.column),
          formartNum(v.loc.end.line),
          formartNum(v.loc.end.column),
        ],
        v.locations.map((loc) => [
          formartNum(loc.start.line),
          formartNum(loc.start.column),
          formartNum(loc.end.line),
          formartNum(loc.end.column),
        ]),
      ],
    ]),
  );
};

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
