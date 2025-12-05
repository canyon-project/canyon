import type React from 'react';
import type { CanyonReportProps } from './types';

/**
 * CanyonReport 组件
 * 用于展示报告内容
 */
export const CanyonReport: React.FC<CanyonReportProps> = ({
  name,
  // content,
  // className,
  // style,
  // bordered = true,
}) => {
  return <div>{name}</div>;
};

export default CanyonReport;
export type { CanyonReportProps } from './types';
