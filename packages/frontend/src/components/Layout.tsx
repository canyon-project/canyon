import { BaseLayout } from 'canyon-ui';
// import { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FolderOutlined, SettingOutlined } from '@ant-design/icons';
import React, {type FC, type ReactNode, useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import type {MenuProps} from "antd";

type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}
const Layout:FC<{
  children: ReactNode;
}> = ({
                  children,
                }) => {
  const { t } = useTranslation();
  const [activeMenuKey, setActiveMenuKey] = useState<string>('');
  const navigate = useNavigate();

  const items: MenuItem[] = [
    getItem(t('menus.projects'), 'projects', <FolderOutlined />),
    getItem(t('menus.settings'), 'settings', <SettingOutlined />),
  ];
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') {
      navigate('/projects'); // Default navigation to projects
    }
  }, []);
  useEffect(() => {
    if (activeMenuKey === 'projects') {
      navigate('/projects');
    }
    if (activeMenuKey === 'settings') {
      navigate('/settings');
    }
  }, [activeMenuKey]);
  return (
    <div>
      <BaseLayout
        value={activeMenuKey}
        onChange={(v) => setActiveMenuKey(v)}
        menuItems={items}
        logo={<img src={'/logo.svg'} className={'w-[36px]'} />}
      >
        {
          children
        }
      </BaseLayout>
    </div>
  );
};

export default Layout;
