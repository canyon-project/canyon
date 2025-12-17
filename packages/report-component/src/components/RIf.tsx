import type { FC, ReactNode } from 'react';

const RIf: FC<{
  condition: boolean | undefined | null;
  children: ReactNode;
}> = ({ condition, children }) => {
  return <>{condition ? children : null}</>;
};

export default RIf;
