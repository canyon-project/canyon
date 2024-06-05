import Icon, {
  ArrowRightOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FolderOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MoneyCollectOutlined,
  MoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Avatar, Breadcrumb, Dropdown, Menu, MenuProps, theme, Tooltip, Typography } from 'antd';
import axios from 'axios';
import { CanyonLayoutBase, CanyonModalGlobalSearch } from 'canyon-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import book from '../assets/book.svg';
import lightLogoSvg from '../assets/light-logo.svg';
import logoSvg from '../assets/logo.svg';
import UilUsersAlt from '../assets/users-icon.tsx';
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
      if (meData?.me.username !== 'tzhangm') {
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
      }
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

  useEffect(() => {
    setMenuSelectedKey(loc.pathname.replace('/', ''));
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
  const { data: baseData } = useRequest(() => axios.get('/api/base').then(({ data }) => data), {
    onSuccess(data) {
      // console.log(data,'ss')
      window.GITLAB_URL = data.GITLAB_URL;
    },
  });
  const [menuSelectedKey, setMenuSelectedKey] = useState<string>('projects');
  window.canyonModalGlobalSearchRef = useRef(null);
  return (
    <>
      {/*<img src={UsageIcon} alt=""/>*/}
      {/*<Button onClick={()=>{*/}
      {/*  window.canyonModalGlobalSearchRef.current.report();*/}
      {/*}}>开启</Button>*/}
      <CanyonLayoutBase
        breadcrumb={
          <div>
            {/*榜单mark*/}
            <Breadcrumb className={'py-3'} items={genBreadcrumbItems(loc.pathname)} />
          </div>
        }
        itemsDropdown={[
          {
            label: (
              <div className={'text-red-500'}>
                <LogoutOutlined className={'mr-2'} />
                Logout
              </div>
            ),
            // icon: <ArrowRightOutlined />,
            onClick: () => {
              localStorage.clear();
              // nav('/login');
              window.location.href = '/login';
            },
          },
        ]}
        MeData={meData}
        onClickGlobalSearch={() => {
          window.canyonModalGlobalSearchRef.current.report();
        }}
        title={'Canyon'}
        logo={
          <div>
            <img src='/logo.svg' alt='' className={'w-[30px]'} />
          </div>
        }
        mainTitleRightNode={
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
        }
        menuSelectedKey={menuSelectedKey}
        onSelectMenu={(selectInfo) => {
          console.log(selectInfo);
          setMenuSelectedKey(selectInfo.key);
          nav(`/${selectInfo.key}`);
        }}
        menuItems={[
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
        ].concat(
          meData?.me.username === 'tzhangm123'
            ? [
                {
                  label: t('menus.usage'),
                  key: 'usage',
                  icon: <LineChartOutlined />,
                },
                {
                  label: t('menus.billing'),
                  key: 'billing',
                  icon: <CreditCardOutlined />,
                },
                {
                  label: t('menus.members'),
                  key: 'members',
                  icon: <Icon component={UilUsersAlt} style={{ fontSize: '15px' }} />,
                },
              ]
            : [],
        )}
        renderMainContent={<Outlet />}
        search={false}
        account={false}
      />
      <CanyonModalGlobalSearch ref={canyonModalGlobalSearchRef} />
    </>
  );
}

export default Index;
