import type { FC, ReactNode } from 'react';

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return <div>{children}</div>;
};

export default BasicLayout;
