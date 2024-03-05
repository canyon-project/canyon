import Icon, {FolderOutlined, LineChartOutlined, MoneyCollectOutlined, SettingOutlined} from '@ant-design/icons';
import { CanyonCardPrimary, CanyonLayoutBase } from '@canyon/ui';
console.log(CanyonLayoutBase, 'CanyonLayoutBase');
import { SolarUserIdLinear } from './assets/icons/SolarUserIdLinear.tsx';
import UsageIcon from './assets/icons/usage.svg?react';
// import {CanyonCardPrimary} from "@canyon/ui/src";
// import ''
const App = () => {
  return (
    <>
      {/*<img src={UsageIcon} alt=""/>*/}

      <CanyonLayoutBase
        title={'Arex'}
        logo={
          <div>
            <img src='/logo.jpg' alt='' className={'w-[30px]'} />
          </div>
        }
        mainTitleRightNode={''}
        menuSelectedKey={'usage'}
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
          {
            label: 'usage',
            key: 'usage',
            icon: <LineChartOutlined />,
          },
          {
            label: 'billing',
            key: 'billing',
            icon: <MoneyCollectOutlined />,
          },
        ]}
        renderMainContent={<CanyonCardPrimary />}
      />
    </>
  );
};

export default App;
