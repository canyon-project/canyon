import { FC, ReactNode } from 'react';

const RIf: FC<{
  condition: boolean;
  children: ReactNode;
}> = ({ condition, children }) => {
  return <>{condition ? <>{children}</> : null}</>;
};

export default RIf;
