import { CoverageSummaryData, FileCoverageData } from 'istanbul-lib-coverage';
enum ThemeEnum {
  Light = 'light',
  Dark = 'dark',
}

export enum LanguageEnum {
  CN = 'cn',
  EN = 'en',
  JA = 'ja',
}
export interface ReportProps {
  theme: ThemeEnum | string;
  language: LanguageEnum | string;
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

export interface CommonProps {
  theme?: 'light' | 'dark';
  locale?: 'en' | 'zh';
}

export interface CommonChildrenProps {
  theme: 'light' | 'dark';
  locale: 'en' | 'zh';
}
