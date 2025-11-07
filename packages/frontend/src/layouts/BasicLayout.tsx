import {
  AppstoreOutlined,
  MoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  // Layout,
  Menu,
  Typography,
  theme,
} from 'antd';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BuildInfo from '@/components/BuildInfo.tsx';

// const { Content } = Layout;

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  type AuthUser = {
    id: string;
    provider: string;
    name?: string;
    username?: string;
  };

  const backendUrl = '';
  const githubLoginUrl = `${backendUrl}/api/auth/github`;
  const gitlabLoginUrl = `${backendUrl}/api/auth/gitlab`;

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // 通过 Cookie 获取登录态
    (async () => {
      try {
        const resp = await fetch(`${backendUrl}/api/user/me`, {
          credentials: 'include',
        });
        if (resp.ok) {
          const me = await resp.json();
          if (me?.id) {
            const user: AuthUser = {
              id: me.id,
              provider: 'oauth',
              name: me.nickname,
              username: me.nickname,
            };
            localStorage.setItem('auth:user', JSON.stringify(user));
            setAuthUser(user);
          }
        }
      } catch {}
    })();

    const sp = new URLSearchParams(location.search);
    const provider = sp.get('provider');
    const id = sp.get('id');
    if (provider && id) {
      const user: AuthUser = {
        id,
        provider,
        name: sp.get('name') || undefined,
        username: sp.get('username') || undefined,
      };
      localStorage.setItem('auth:user', JSON.stringify(user));
      setAuthUser(user);
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate, location.pathname]);

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
      <div className='h-[77px] py-4 px-4 flex items-center justify-between'>
        {authUser ? (
          <>
            <div className='flex items-center gap-3'>
              <Avatar size={32}>
                {(authUser.name || authUser.username || 'U')
                  .slice(0, 1)
                  .toUpperCase()}
              </Avatar>
              <div className='flex flex-col'>
                <Typography.Text ellipsis className='w-[150px]'>
                  {authUser.name || authUser.username || 'User'}
                </Typography.Text>
                <Typography.Text
                  ellipsis
                  className='w-[150px]'
                  type='secondary'
                >
                  {authUser.provider} · {authUser.id}
                </Typography.Text>
              </div>
            </div>
            <Dropdown
              menu={{
                items: [{ key: 'logout', label: t('退出登录') || '退出登录' }],
                onClick: async ({ key }) => {
                  if (key === 'logout') {
                    try {
                      await fetch(`${backendUrl}/api/user/logout`, {
                        credentials: 'include',
                      });
                    } catch {
                    } finally {
                      localStorage.removeItem('auth:user');
                      setAuthUser(null);
                    }
                  }
                },
              }}
            >
              <MoreOutlined className='cursor-pointer' />
            </Dropdown>
          </>
        ) : (
          <div className='w-full flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Avatar size={32}>?</Avatar>
              <div className='flex flex-col'>
                <Typography.Text
                  type='secondary'
                  className='w-[150px]'
                  ellipsis
                >
                  未登录
                </Typography.Text>
              </div>
            </div>
            <div className=''>
              <Button
                type='primary'
                size='small'
                onClick={() => {
                  window.location.href = githubLoginUrl;
                }}
              >
                GitHub 登录
              </Button>
              <Button
                size='small'
                onClick={() => {
                  window.location.href = gitlabLoginUrl;
                }}
              >
                GitLab 登录
              </Button>
            </div>
          </div>
        )}
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
      <div className={'flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]'}>
        <div className={'m-auto max-w-[1200px] min-w-[1000px] p-[12px]'}>
          <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <BuildInfo />
    </div>
  );
};

export default BasicLayout;
