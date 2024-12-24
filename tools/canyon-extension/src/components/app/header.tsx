import { GithubOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';

import logo from '../../assets/light-logo.svg';
const AppHeader = () => {
  return (
    <header
      className={'header'}
      css={css`
        padding-left: 20px;
        padding-right: 20px;
        background-color: #3264ff;
        height: 72px;
        color: white;
        line-height: 72px;
        display: flex;
        justify-content: space-between;
      `}
    >
      <div
        style={{ fontSize: '24px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => {
          window.open('https://github.com/canyon-project/canyon');
        }}
      >
        <img style={{ width: '36px', marginRight: '12px' }} src={logo} alt='' />
        <span style={{ fontWeight: 'bold' }}>Canyon</span>
      </div>

      <div
        style={{ cursor: 'pointer' }}
        onClick={() => {
          window.open('https://github.com/canyon-project/canyon');
        }}
      >
        <GithubOutlined />
      </div>
    </header>
  );
};

export default AppHeader;
