import {
  AppstoreOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Select, Switch, theme } from 'antd';
import type { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const selected = `/${location.pathname.split('/')[1] || 'projects'}`;

  const onThemeChange = (checked: boolean) => {
    const next = checked ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', checked);
    // 让 ConfigProvider 生效
    window.location.reload();
  };

  const onLanguageChange = (lng: 'cn' | 'en' | 'ja') => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
    // 让 ConfigProvider locale 生效
    window.location.reload();
  };

  return (
    <Layout className='min-h-screen'>
      <Sider width={224} breakpoint='lg' collapsedWidth={56} theme='light'>
        <div
          className='h-14 flex items-center px-4 text-[15px] font-medium border-b'
          style={{ borderColor: token.colorBorder }}
        >
          <Link to='/projects' className='flex items-center gap-2'>
            <div
              className='w-6 h-6 rounded-full flex items-center justify-center text-white'
              style={{ background: token.colorPrimary }}
            >
              C
            </div>
            <span>Canyon</span>
          </Link>
        </div>

        <Menu
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
            {
              key: '/usage',
              icon: <BarChartOutlined />,
              label: t('menus.usage'),
              onClick: () => navigate('/usage'),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          className='flex items-center justify-end gap-4 h-14 px-4'
          style={{ background: 'transparent' }}
        >
          <div className='flex items-center gap-3'>
            <span className='text-[12px] text-gray-500'>
              {t('common.language')}
            </span>
            <Select
              size='small'
              style={{ width: 96 }}
              defaultValue={
                (localStorage.getItem('language') || 'cn') as 'cn' | 'en' | 'ja'
              }
              options={[
                { label: '简体中文', value: 'cn' },
                { label: 'English', value: 'en' },
                { label: '日本語', value: 'ja' },
              ]}
              onChange={onLanguageChange}
            />
            <span className='text-[12px] text-gray-500'>
              {t('common.theme')}
            </span>
            <Switch
              checkedChildren={t('common.dark')}
              unCheckedChildren={t('common.light')}
              defaultChecked={localStorage.getItem('theme') === 'dark'}
              onChange={onThemeChange}
            />
          </div>
        </Header>
        <Content className='p-6 bg-white/0'>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
