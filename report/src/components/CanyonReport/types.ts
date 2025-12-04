import type { ReactNode } from 'react';

export interface CanyonReportProps {
  /** 报告标题 */
  title?: string;
  /** 报告内容 */
  content?: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示边框 */
  bordered?: boolean;
}
