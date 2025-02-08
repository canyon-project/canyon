import { GithubOutlined } from '@ant-design/icons';

import logo from '../../assets/logo.svg';
const AppHeader = () => {
  return (
    <header
      className={'px-5 bg-[#3264ff] h-[72px] text-white leading-[72px] flex justify-between header'}
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
        <GithubOutlined style={{
          fontSize: '18px',
        }} />
      </div>
    </header>
  );
};

export default AppHeader;
