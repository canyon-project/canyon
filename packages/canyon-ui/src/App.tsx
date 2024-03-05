import { FolderOutlined, SettingOutlined } from '@ant-design/icons';

import { CanyonCardPrimary, CanyonLayoutBase } from './index.ts';
// import ''
const App = () => {
  return (
    <>
      <CanyonLayoutBase
        logo={
          <div>
            <img src='/logo.svg' alt='' className={'w-[30px]'} />
          </div>
        }
        mainTitleRightNode={'m'}
        menuSelectedKey={'projects'}
        onSelectMenu={(selectInfo) => {
          console.log(selectInfo);
        }}
        menuItems={[
          {
            label: 'projects',
            key: 'projects',
            icon: <FolderOutlined />,
          },
          {
            label: 'settings',
            key: 'settings',
            icon: <SettingOutlined />,
          },
        ]}
      />
    </>
  );
};

export default App;
