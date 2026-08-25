import type { CoverageSummaryEntry, CoverageSummaryMap } from "./client.ts";

export type AggregatedCoverage = {
  statements: { total: number; covered: number; pct: number };
  changestatements: { total: number; covered: number; pct: number };
  changedFiles: number;
  files: number;
};

export function aggregateCoverageSummary(summary: CoverageSummaryMap): AggregatedCoverage {
  let statementsTotal = 0;
  let statementsCovered = 0;
  let changeTotal = 0;
  let changeCovered = 0;
  let changedFiles = 0;

  for (const entry of Object.values(summary)) {
    statementsTotal += entry.statements?.total ?? 0;
    statementsCovered += entry.statements?.covered ?? 0;
    if (entry.change) {
      changedFiles += 1;
      changeTotal += entry.changestatements?.total ?? 0;
      changeCovered += entry.changestatements?.covered ?? 0;
    }
  }

  return {
    statements: {
      total: statementsTotal,
      covered: statementsCovered,
      pct: pct(statementsCovered, statementsTotal),
    },
    changestatements: {
      total: changeTotal,
      covered: changeCovered,
      pct: pct(changeCovered, changeTotal),
    },
    changedFiles,
    files: Object.keys(summary).length,
  };
}

export function topChangedFiles(
  summary: CoverageSummaryMap,
  limit = 10,
): Array<{
  path: string;
  changestatements: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
}> {
  return Object.entries(summary)
    .filter(([, entry]) => entry.change && (entry.changestatements?.total ?? 0) > 0)
    .map(([path, entry]) => ({
      path: entry.path || path,
      changestatements: {
        total: entry.changestatements?.total ?? 0,
        covered: entry.changestatements?.covered ?? 0,
        pct: entry.changestatements?.pct ?? 0,
      },
      statements: {
        total: entry.statements?.total ?? 0,
        covered: entry.statements?.covered ?? 0,
        pct: entry.statements?.pct ?? 0,
      },
    }))
    .sort((a, b) => a.changestatements.pct - b.changestatements.pct)
    .slice(0, limit);
}

export function uncoveredChangedFiles(
  summary: CoverageSummaryMap,
  limit = 20,
): Array<{
  path: string;
  uncoveredChangeStatements: number;
  changestatements: { total: number; covered: number; pct: number };
}> {
  return Object.entries(summary)
    .filter(([, entry]) => {
      const total = entry.changestatements?.total ?? 0;
      const covered = entry.changestatements?.covered ?? 0;
      return entry.change && total > covered;
    })
    .map(([path, entry]) => ({
      path: entry.path || path,
      uncoveredChangeStatements:
        (entry.changestatements?.total ?? 0) - (entry.changestatements?.covered ?? 0),
      changestatements: {
        total: entry.changestatements?.total ?? 0,
        covered: entry.changestatements?.covered ?? 0,
        pct: entry.changestatements?.pct ?? 0,
      },
    }))
    .sort((a, b) => b.uncoveredChangeStatements - a.uncoveredChangeStatements)
    .slice(0, limit);
}

function pct(covered: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((covered / total) * 10000) / 100;
}

export function compactSummaryEntry(entry: CoverageSummaryEntry) {
  return {
    path: entry.path,
    change: entry.change ?? false,
    statements: entry.statements,
    changestatements: entry.changestatements,
    newlines: entry.newlines,
  };
}
