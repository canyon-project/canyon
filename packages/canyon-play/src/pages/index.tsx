import Icon, {
  DashboardOutlined,
  FolderOutlined,
  LineChartOutlined,
  MoneyCollectOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { CanyonCardPrimary, CanyonLayoutBase, CanyonModalGlobalSearch } from 'canyon-ui';
console.log(CanyonLayoutBase, 'CanyonLayoutBase');
import { useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { SolarUserIdLinear } from './assets/icons/SolarUserIdLinear.tsx';
import UsageIcon from './assets/icons/usage.svg?react';
import {Button} from "antd";
// import CanyonModalGlobalSearch from "canyon-ui/src/components/modal/GlobalSearch.tsx";
// import {CanyonCardPrimary} from "canyon-ui/src";
// import ''
const IndexPage = () => {
  const nav = useNavigate();
  const [menuSelectedKey, setMenuSelectedKey] = useState<string>('usage');
  window.canyonModalGlobalSearchRef = useRef(null);
  return (
    <>
      {/*<img src={UsageIcon} alt=""/>*/}
      {/*<Button onClick={()=>{*/}
      {/*  window.canyonModalGlobalSearchRef.current.report();*/}
      {/*}}>开启</Button>*/}
      <CanyonLayoutBase
        onClickGlobalSearch={() => {
          window.canyonModalGlobalSearchRef.current.report();
        }}
        title={'Arex'}
        logo={
          <div>
            <img src='/logo.jpg' alt='' className={'w-[30px]'} />
          </div>
        }
        mainTitleRightNode={''}
        menuSelectedKey={menuSelectedKey}
        onSelectMenu={(selectInfo) => {
          console.log(selectInfo);
          setMenuSelectedKey(selectInfo.key);
          nav(`/${selectInfo.key}`);
        }}
        menuItems={[
          {
            label: 'Dashboard',
            key: 'dashboard',
            icon: <DashboardOutlined />,
          },
          {
            label: 'Projects',
            key: 'projects',
            icon: <FolderOutlined />,
          },
          {
            label: 'Settings',
            key: 'settings',
            icon: <SettingOutlined />,
          },
          {
            label: 'Usage',
            key: 'usage',
            icon: <LineChartOutlined />,
          },
          {
            label: 'Billing',
            key: 'billing',
            icon: <MoneyCollectOutlined />,
          },
        ]}
        renderMainContent={<Outlet />}
      />
      <CanyonModalGlobalSearch ref={canyonModalGlobalSearchRef} />
    </>
  );
};

export default IndexPage;
