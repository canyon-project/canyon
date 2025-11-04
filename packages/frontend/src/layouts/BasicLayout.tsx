import {
  AppstoreOutlined,
  BarChartOutlined,
  MoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu, Typography, theme } from 'antd';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Content } = Layout;

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const selected = `/${location.pathname.split('/')[1] || 'projects'}`;

  // 分区组件：侧边头部（Logo 与标题）
  const SidebarHeader: FC = () => (
    <div className={'px-3 py-[16px] flex items-center justify-between'}>
      <div
        className={'cursor-pointer flex items-center'}
        style={{ marginBottom: 0 }}
      >
        <img src='/logo.svg' className={'w-[36px]'} alt='' />
        <span
          className={'ml-[6px]'}
          style={{
            fontSize: '18px',
            fontWeight: 'bolder',
          }}
        >
          Canyon
        </span>
      </div>

      <div>{''}</div>
    </div>
  );

  // 分区组件：侧边菜单
  const SidebarMenu: FC = () => (
    <Menu
      className={'flex-1'}
      mode='inline'
      selectedKeys={[selected]}
      items={[
        {
          key: '/projects',
          icon: <AppstoreOutlined />,
          label: <Link to='/projects'>{t('menus.projects')}</Link>,
          onClick: () => navigate('/projects'),
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: t('menus.settings'),
          onClick: () => navigate('/settings'),
        },
      ]}
    />
  );

  // 分区组件：用户信息与操作
  const SidebarUser: FC = () => (
    <div className='border-t' style={{ borderColor: token.colorBorder }}>
      <div className='h-[77px] py-4 px-4 flex items-center justify-between cursor-pointer'>
        <div className='flex items-center gap-3'>
          <Avatar size={32}>A</Avatar>
          <div className='flex flex-col'>
            <Typography.Text ellipsis className='w-[150px]'>
              用户一
            </Typography.Text>
            <Typography.Text ellipsis className='w-[150px]' type='secondary'>
              user1@example.com
            </Typography.Text>
          </div>
        </div>
        <Dropdown
          menu={{
            items: [
              { key: 'switch-1', label: '切换' },
              { key: 'manage-1', label: '管理' },
            ],
            onClick: () => {},
          }}
        >
          <MoreOutlined />
        </Dropdown>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen flex'>
      <div
        className={'w-[260px] h-[100vh] overflow-hidden flex flex-col'}
        style={{
          borderRight: `1px solid ${token.colorBorder}`,
        }}
      >
        <SidebarHeader />

        <div
          className={'mb-1'}
          style={{
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        />

        <SidebarMenu />

        <SidebarUser />
      </div>
      <div className={'flex-1'}>
        <Content className='p-6 bg-white/0'>{children}</Content>
      </div>
    </div>
  );
};

export default BasicLayout;
