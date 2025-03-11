import {Breadcrumb, Divider, Tabs} from 'antd';
import UserSettings from '@/pages/SettingsPage/UserSettings.tsx';
import useUserStore from '@/store/userStore.ts';
import { useEffect } from 'react';

const SettingsPage = () => {
  return (
    <div>
      <div
        className={
          'h-[48px] flex items-center px-[16px]'
        }
      >
        <Breadcrumb
          items={[
            {
              title: 'Home',
            },
            {
              title: <a href="">Application Center</a>,
            },
            {
              title: <a href="">Application List</a>,
            },
            {
              title: 'An Application',
            },
          ]}
        />
      </div>
      <Divider style={{ margin: '0' }} />
      <Tabs
        items={[
          {
            label: 'General',
            key: 'general',
            children: (
              <div>
                <UserSettings />
              </div>
            ),
          },
          {
            label: 'Billing',
            key: 'billing',
            children: <div>Billing</div>,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
