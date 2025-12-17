import type { FileCoverageData } from 'istanbul-lib-coverage';

/**
 * 文件数据响应接口
 */
export interface FileDataResponse {
  fileCoverage: FileCoverageData;
  fileContent: string;
  fileCodeChange: number[];
}

export interface DataSourceItem {
  path: string;
  [key: string]: any;
}

export interface CanyonReportProps {
  /** 报告名称 */
  name: string;
  /** 当前选中的文件 */
  value: string;
  dataSource: DataSourceItem[];
  onSelect: (val: string) => Promise<FileDataResponse>;
}
