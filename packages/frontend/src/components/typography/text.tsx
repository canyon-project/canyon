import { Space } from 'antd';
import type { CSSProperties, FC, ReactNode } from 'react';
import { cn } from '@/lib/utils.ts';

interface TextTypographyProps {
  title: string;
  icon: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
}
const TextTypography: FC<TextTypographyProps> = ({
  title,
  icon,
  right,
  style,
}) => {
  return (
    <div
      style={style}
      className={cn('flex', 'justify-between', 'items-center', 'mb-5')}
    >
      <Space style={{ fontSize: '25px', fontWeight: 500 }}>
        <span className={'text-[#687076] text-[32px]'}>{icon}</span>
        {title}
      </Space>
      <div>{right}</div>
    </div>
  );
};

export default TextTypography;
