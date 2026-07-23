import type { FileCoverageData } from "istanbul-lib-coverage";

/**
 * 文件数据响应接口
 */
export interface FileDataResponse {
  fileCoverage: FileCoverageData;
  fileContent: string;
  fileCodeChange: {
    additions: number[];
    deletions: number[];
  };
}

export interface DataSourceItem {
  path: string;
  /** 该文件相对基准是否有变更（用于 Only Changed 筛选） */
  change?: boolean;
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

/** 原始覆盖率文件（来自 report HTML / window.reportData.files） */
export interface CanyonReportAppFile {
  path: string;
  source: string;
  diff?: {
    additions: number[];
    deletions: number[];
  };
  [key: string]: unknown;
}

export interface CanyonReportAppProps {
  /** 覆盖率文件列表 */
  files: CanyonReportAppFile[];
  /** 插桩工作目录，用于裁剪文件路径前缀 */
  instrumentCwd: string;
  /** 报告生成时间 */
  generatedAt?: string;
  /** 报告名称，默认 "All files" */
  name?: string;
  /** 默认是否只展示变更文件，默认 true */
  defaultOnlyChange?: boolean;
  /** 初始选中路径 */
  defaultValue?: string;
  /** 页脚展示的 npm 包名（如 @canyonjs/report） */
  packageName?: string;
  /** 页脚展示的 npm 包版本 */
  packageVersion?: string;
  /** 容器高度，默认 calc(100vh - 16px) */
  height?: string | number;
  /** 是否展示页脚，默认 true */
  showFooter?: boolean;
}
