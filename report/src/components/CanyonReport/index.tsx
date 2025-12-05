import React, {useEffect} from 'react';
import type { CanyonReportProps } from './types';

/**
 * CanyonReport 组件
 * 用于展示报告内容
 */
export const CanyonReport: React.FC<CanyonReportProps> = ({
  name,
  onSelect,
  value
  // content,
  // className,
  // style,
  // bordered = true,
}) => {
  useEffect(() => {
    onSelect(value)
  }, [value]);
  return <div>{name}</div>;
};

export default CanyonReport;
export type { CanyonReportProps } from './types';
