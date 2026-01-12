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
  [key: string]: unknown;
}

export interface CanyonReportProps {
  /** 报告名称 */
  name: string;
  /** 当前选中的文件 */
  value: string;
  dataSource: DataSourceItem[];
  onSelect: (val: string) => Promise<FileDataResponse>;
  /** 默认是否只展示变更的文件，默认为 false（非受控模式使用） */
  defaultOnlyChange?: boolean;
  /** 是否只展示变更的文件（受控模式） */
  onlyChange?: boolean;
  /** 当 onlyChange 状态改变时的回调（受控模式） */
  onChangeOnlyChange?: (value: boolean) => void;
}
