import libCoverage, {
  CoverageMapData,
  CoverageSummaryData,
  Totals,
} from "istanbul-lib-coverage";
export interface CodeChange {
  path: string;
  additions: number[];
}
export interface CoverageSummaryDataMap {
  [key: string]: CoverageSummaryData & { newlines: Totals,path:string,change:boolean };
}

export const genSummaryMapByCoverageMap = (
  coverageMapData: CoverageMapData,
  codeChanges?: CodeChange[],
): CoverageSummaryDataMap => {
  const summaryMap: any = {};
  const m = libCoverage.createCoverageMap((coverageMapData));
  m.files().forEach(function (f) {
    const fc = m.fileCoverageFor(f),
      s = fc.toSummary();
    const additions = codeChanges?.find((c) => `${c.path}` === f)?.additions || [];
    summaryMap[f] = {
      ...s.data,
      newlines:{ total: 0, covered: 0, skipped: 0, pct: 100 },
      path: f,
      change:additions.length > 0
    };
  });
  return JSON.parse(JSON.stringify(summaryMap));
};
