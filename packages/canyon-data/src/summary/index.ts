import { percent } from "../utils/percent";
import libCoverage, {
  CoverageMapData,
  CoverageSummaryData,
  Totals,
} from "istanbul-lib-coverage";
import { calculateNewLineCoverageForSingleFile } from "../utils/line";
import { emptySummary } from "./helpers";
import { fCoverageData } from "../utils/fCoverageData";
export interface CodeChange {
  path: string;
  additions: number[];
}
export interface CoverageSummaryDataMap {
  [key: string]: CoverageSummaryData & { newlines: Totals,path:string,change:boolean };
}

/**
 * 合并两个概要数据
 * @param first 第一个概要数据
 * @param second 第二个概要数据
 * @returns 合并过后的概要数据
 */
export function mergeSummary(first: any, second: any): any {
  const ret = JSON.parse(JSON.stringify(first));
  const keys = [
    "lines",
    "statements",
    "branches",
    "functions",
    "branchesTrue",
    "newlines",
  ];
  keys.forEach((key) => {
    if (second[key]) {
      ret[key].total += second[key].total;
      ret[key].covered += second[key].covered;
      ret[key].skipped += second[key].skipped;
      ret[key].pct = percent(ret[key].covered, ret[key].total);
    }
  });

  return ret;
}

export const genSummaryMapByCoverageMap = (
  coverageMapData: CoverageMapData,
  codeChanges?: CodeChange[],
): CoverageSummaryDataMap => {
  const summaryMap: any = {};
  const m = libCoverage.createCoverageMap(fCoverageData(coverageMapData));
  m.files().forEach(function (f) {
    const fc = m.fileCoverageFor(f),
      s = fc.toSummary();
    const additions = codeChanges?.find((c) => `${c.path}` === f)?.additions || [];
    summaryMap[f] = {
      ...s.data,
      newlines:calculateNewLineCoverageForSingleFile(fc.data,additions),
      path: f,
      change:additions.length > 0
    };
  });
  return JSON.parse(JSON.stringify(summaryMap));
};

export const getSummaryByPath = (
  path: string,
  summary: CoverageSummaryDataMap,
) => {
  let summaryObj = JSON.parse(JSON.stringify(emptySummary));
  const filterSummary = Object.keys(summary).reduce((pre: any, cur) => {
    if (cur.startsWith(path + "/") || path === "" || cur === path) {
      pre[cur] = summary[cur];
    }
    return pre;
  }, {});

  Object.keys(filterSummary).forEach((item) => {
    summaryObj = mergeSummary(summaryObj, filterSummary[item]);
  });
  return JSON.parse(JSON.stringify(summaryObj));
};

// summary 是总的
export const genSummaryTreeItem = (
  path: string,
  summary: CoverageSummaryDataMap,
): {
  path: string;
  summary: CoverageSummaryData;
  children: {
    path: string;
    summary: CoverageSummaryData;
  }[];
} => {
  function check(item: string, path: string) {
    if (path === "") {
      return true;
    }
    return item.startsWith(path + "/") || item === path;
  }

  // 如果是文件
  if (Object.keys(summary).find((item) => item === path)) {
    return {
      path,
      summary: getSummaryByPath(path, summary),
      children: [],
    };
  }
  // 如果是文件夹
  const fileLists: string[] = [];
  const folderLists: string[] = [];

  Object.keys(summary).forEach((item) => {
    const newpath = path === "" ? item : item.replace(path + "/", "");
    if (check(item, path) && !newpath.includes("/")) {
      fileLists.push(item);
    }
    if (check(item, path) && newpath.includes("/")) {
      folderLists.push((path === "" ? "" : path + "/") + newpath.split("/")[0]);
    }
  });


  return {
    path,
    summary: getSummaryByPath(path, summary),
    children: [
      // @ts-ignore
      ...[...new Set(fileLists)].map((item) => {
        return {
          path: item,
          summary: getSummaryByPath(item, summary),
        };
      }),
      // @ts-ignore
      ...[...new Set(folderLists)].map((item) => {
        return {
          path: item,
          summary: getSummaryByPath(item, summary),
        };
      }),
    ],
  };
};
