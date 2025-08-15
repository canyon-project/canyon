import styled from '@emotion/styled';
import { Divider } from 'antd';
import type { FC, ReactNode } from 'react';

const AppRowStyle = styled.div`
  display: flex;
  flex-direction: column;
  .title {
    position: relative;
    margin-left: 10px;
    font-weight: bold;
    display: block;
    margin-bottom: 16px;
    font-size: 16px;
  }
  .title::before {
    content: '';
    display: block;
    width: 4px;
    height: 16px;
    background-color: #3264ff;
    position: absolute;
    left: -10px;
    top: 1px;
  }
`;
const AppRow: FC<{ children: ReactNode; title: string }> = ({ children, title }) => {
  return (
    <AppRowStyle>
      <span className={'title'}>{title}</span>
      {children}
      <Divider />
    </AppRowStyle>
  );
};

export default AppRow;
