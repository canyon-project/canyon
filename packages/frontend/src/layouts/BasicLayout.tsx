import type { FC, ReactNode } from 'react';

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <div>
      我是layout
      {children}
    </div>
  );
};

export default BasicLayout;
