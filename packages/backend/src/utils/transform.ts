// @ts-nocheck
import { getBranchTypeIndex } from './getBranchType';

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
