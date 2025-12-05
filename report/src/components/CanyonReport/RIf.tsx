import type { FC, ReactNode } from 'react';

const RIf: FC<{
  condition: any;
  children: ReactNode;
}> = ({ condition, children }) => {
  return <>{condition ? <>{children}</> : null}</>;
};

export default RIf;
