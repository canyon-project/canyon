import type React from 'react';
import type { CanyonReportProps } from './types';

/**
 * CanyonReport 组件
 * 用于展示报告内容
 */
export const CanyonReport: React.FC<CanyonReportProps> = ({
  title,
  content,
  className,
  style,
  bordered = true,
}) => {
  return (
    <div
      className={className}
      style={{
        padding: '16px',
        border: bordered ? '1px solid #d9d9d9' : 'none',
        borderRadius: '4px',
        backgroundColor: '#fff',
        ...style,
      }}
    >
      {title && (
        <h2
          style={{
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: 600,
            color: '#262626',
          }}
        >
          {title}
        </h2>
      )}
      <div style={{ color: '#595959', lineHeight: '1.6' }}>{content}</div>
    </div>
  );
};

export default CanyonReport;
export type { CanyonReportProps } from './types';
