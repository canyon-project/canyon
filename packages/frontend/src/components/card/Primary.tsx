import { theme } from 'antd';
import type { FC } from 'react';

const { useToken } = theme;
const CardPrimary: FC<{
  children: any;
}> = ({ children }) => {
  const { token } = useToken();
  return (
    <div
      className={'rounded-[8px] overflow-hidden'}
      style={{
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `${token.boxShadowTertiary}`,
      }}
    >
      {children}
    </div>
  );
};

export default CardPrimary;
