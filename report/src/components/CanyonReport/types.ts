import type {
  CoverageSummaryData,
  FileCoverageData,
} from 'istanbul-lib-coverage';

/**
 * 文件数据响应接口
 */
export interface FileDataResponse {
  fileCoverage: FileCoverageData;
  fileContent: string;
  fileCodeChange: {
    additions: number[];
    deletions: number[];
  }[];
}

export interface CanyonReportProps {
  /** 报告名称 */
  name: string;
  /** 数据源 */
  dataSource: Record<string, CoverageSummaryData & { path: string }>;
  /** 当前选中的文件 */
  value: string;
  /** 选择文件的回调函数 */
  onSelect: (val: string) => Promise<FileDataResponse>;
  /** 是否只显示变更的文件（受控属性） */
  onlyShowChanged: boolean;
  /** 是否只显示变更文件的变更事件回调 */
  onOnlyShowChangedChange: (value: boolean) => void;
  // onlyShowChanged是否禁用
  onlyShowChangedDisabled?: boolean;
}
