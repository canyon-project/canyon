import { CoverageSummaryData, FileCoverageData } from "istanbul-lib-coverage";

/**
 * 主题枚举
 */
export enum ThemeEnum {
  Light = "light",
  Dark = "dark",
}

/**
 * 语言枚举
 */
export enum LanguageEnum {
  CN = "cn",
  EN = "en",
  JA = "ja",
}

/**
 * 文件数据响应接口
 */
export interface FileDataResponse {
  fileCoverage: FileCoverageData;
  fileContent: string;
  fileCodeChange: number[];
}

/**
 * 报告组件属性接口
 */
export interface ReportProps {
  /** 主题设置 */
  theme: ThemeEnum | string;
  /** 语言设置 */
  language: LanguageEnum | string;
  /** 报告名称 */
  name: string;
  /** 数据源 */
  dataSource: Record<string, CoverageSummaryData & { path: string }>;
  /** 当前选中的文件 */
  value: string;
  /** 选择文件的回调函数 */
  onSelect: (val: string) => Promise<FileDataResponse>;
  /** 是否默认只显示变更的文件 */
  defaultOnlyShowChanged: boolean;
}

/**
 * 通用属性接口
 */
export interface CommonProps {
  /** 主题 */
  theme?: ThemeEnum | string;
  /** 区域设置 */
  locale?: LanguageEnum | string;
}

/**
 * 通用子组件属性接口
 */
export interface CommonChildrenProps {
  /** 主题 */
  theme: ThemeEnum | string;
  /** 区域设置 */
  locale: LanguageEnum | string;
}

/**
 * 显示模式类型
 */
export type ShowModeType = "tree" | "list" | "file";

/**
 * 树节点数据接口
 */
export interface TreeNodeData {
  key: string;
  title: string;
  children?: TreeNodeData[];
  isLeaf?: boolean;
  coverage?: CoverageSummaryData;
  path?: string;
}
