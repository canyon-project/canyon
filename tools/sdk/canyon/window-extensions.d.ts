// 不检查ts类型
// @ts-nocheck
// window-extensions.d.ts
// 首先定义一些可能用到的子类型

// 表示对象中类似 "s"、"f"、"b" 这种键对应的值的类型
type CoverageObjectValues = {
  [key: string]: number | number[];
};

// 定义 window.__coverage__ 的类型
interface WindowCoverage {
  path: string;
  s: CoverageObjectValues;
  f: CoverageObjectValues;
  b: CoverageObjectValues;
  _coverageSchema: string;
  hash: string;
  sha: string;
  projectID: string;
  instrumentCwd: string;
  dsn: string;
  reporter: string;
  compareTarget: string;
}

// 扩展全局 Window 接口
declare global {
  interface Window {
    __coverage__: {
      [key: string]: WindowCoverage;
    }
    timer?: any;
    logTimeCost?: (label: string, cost: number) => void;
  }
}

export {}
