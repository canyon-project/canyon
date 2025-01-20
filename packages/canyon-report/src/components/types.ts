import { CoverageSummaryData, FileCoverageData } from "istanbul-lib-coverage";

export interface ReportProps {
  name: string;
  dataSource: { [key: string]: CoverageSummaryData & { path: string } };
  value: string; // 当前选中的文件
  onSelect: (val: string) => Promise<{
    fileCoverage: FileCoverageData;
    fileContent: string;
    fileCodeChange: number[];
  }>;
  defaultOnlyShowChanged: boolean;
}