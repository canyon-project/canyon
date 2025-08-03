import { FC, ReactNode } from 'react';

const RShow: FC<{
  condition: boolean;
  children: ReactNode;
}> = ({ condition, children }) => {
  return (
    <div
      style={{
        display: condition ? 'block' : 'none',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default RShow;
