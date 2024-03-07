import {
  ArrowRightOutlined,
  FolderOutlined,
  LogoutOutlined,
  MoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Avatar, Breadcrumb, Dropdown, Menu, MenuProps, theme, Tooltip, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import book from '../assets/book.svg';
import lightLogoSvg from '../assets/light-logo.svg';
import logoSvg from '../assets/logo.svg';
import AppFooter from '../components/app/footer.tsx';
import { MeDocument } from '../helpers/backend/gen/graphql.ts';
import { genBreadcrumbItems } from '../layouts/genBreadcrumbItems.tsx';
import ScrollBasedLayout from '../ScrollBasedLayout.tsx';
const { useToken } = theme;
const { Text, Title } = Typography;
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

function Index() {
  const { t } = useTranslation();
  const items: MenuProps['items'] = [
    {
      label: t('menus.projects'),
      key: 'projects',
      icon: <FolderOutlined />,
    },
    {
      label: t('menus.settings'),
      key: 'settings',
      icon: <SettingOutlined />,
    },
  ];
  useEffect(() => {
    if (localStorage.getItem('token') === null) {
      localStorage.clear();
      localStorage.setItem('callback', window.location.href);
      nav('/login');
    }
  }, []);

  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (loc.pathname === '/') {
      nav('/projects');
    }

    try {
      // @ts-ignore
      fetch(window.__canyon__.dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          // @ts-ignore
          coverage: window.__coverage__,
          // @ts-ignore
          commitSha: window.__canyon__.commitSha,
          // @ts-ignore
          projectID: window.__canyon__.projectID,
          // @ts-ignore
          instrumentCwd: window.__canyon__.instrumentCwd,
          // @ts-ignore
          reportID: `${meData?.me.username};${loc.pathname};${window.__canyon__.commitSha.slice(0, 8)}`,
          // @ts-ignore
          branch: window.__canyon__.branch,
        }),
      });
    } catch (e) {
      // console.log(e);
    }
  }, [loc.pathname]);

  const selectedKey = useMemo(() => {
    if (loc.pathname === '/') {
      return 'projects';
    } else {
      return loc.pathname.replace('/', '');
    }
  }, [loc.pathname]);
  const { token } = useToken();
  const { data: meData } = useQuery(MeDocument);
  const dropdownItems = [getItem(t('app.logout'), 'logout', <LogoutOutlined />)];
  const dropdownClick = ({ key }: any) => {
    if (key === 'logout') {
      localStorage.clear();
      window.location.href = '/login';
    }
  };
  const { data: baseData } = useRequest(() => axios.get('/api/base').then(({ data }) => data));
  return (
    <>
      <ScrollBasedLayout
        sideBar={
          <div
            className={'w-[260px] h-[100vh] overflow-hidden flex flex-col'}
            style={{ borderRight: `1px solid ${token.colorBorder}` }}
          >
            <div
              className={'px-3 py-[16px] mb-[8px]'}
              style={{ borderBottom: `1px solid ${token.colorBorder}` }}
            >
              <div className={'text-xl font-bold flex items-center justify-between'}>
                <Title
                  level={4}
                  className={'cursor-pointer'}
                  style={{ marginBottom: 0 }}
                  onClick={() => {
                    nav(`/`);
                  }}
                >
                  <img
                    className={'w-[30px] mr-[8px]'}
                    src={localStorage.getItem('theme') === 'dark' ? lightLogoSvg : logoSvg}
                    alt=''
                  />
                  Canyon
                </Title>

                <div>
                  <Tooltip
                    title={
                      <div>
                        <span>{t('menus.docs')}</span>
                        <ArrowRightOutlined />
                      </div>
                    }
                  >
                    <a
                      href={baseData?.SYSTEM_QUESTION_LINK}
                      target={'_blank'}
                      rel='noreferrer'
                      className={'ml-2'}
                    >
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={book} />
                    </a>
                  </Tooltip>
                  {/*marker position*/}
                </div>
              </div>
            </div>
            <Menu
              onSelect={(selectInfo) => {
                if (selectInfo.key === 'projects') {
                  nav('/projects');
                } else {
                  nav(selectInfo.key);
                }
              }}
              selectedKeys={[selectedKey]}
              items={items}
              className={'dark:bg-[#151718]'}
              style={{ flex: '1' }}
            />

            <Dropdown menu={{ items: dropdownItems, onClick: dropdownClick }}>
              <div
                className={
                  'h-[77px] py-[16px] px-[16px] flex items-center justify-between cursor-pointer'
                }
                style={{ borderTop: `1px solid ${token.colorBorder}` }}
              >
                <Avatar src={meData?.me.avatar}></Avatar>
                <div className={'flex flex-col'}>
                  <Text>{meData?.me.nickname}</Text>
                  <Text type={'secondary'}>{meData?.me.email || ''}</Text>
                </div>
                <MoreOutlined className={'dark:text-[#fff]'} />
              </div>
            </Dropdown>
          </div>
        }
        mainContent={
          <div className={'flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]'}>
            <div className={'m-auto max-w-[1250px]'}>
              <div>
                <Breadcrumb className={'pt-3 pb-3 pl-6'} items={genBreadcrumbItems(loc.pathname)} />
              </div>
              <Outlet />
            </div>
          </div>
        }
        footer={<AppFooter />}
      />
    </>
  );
}

export default Index;
