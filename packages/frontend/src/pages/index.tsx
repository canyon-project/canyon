import { BaseLayout } from '@/components/ui';
import { FolderOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}
const IndexPage = () => {
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
        <Outlet />
      </BaseLayout>
    </div>
  );
};

export default IndexPage;
