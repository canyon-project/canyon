import React, { useEffect } from 'react';
import { FolderOutlined, SettingOutlined } from '@ant-design/icons';
import {Menu, MenuProps, theme} from 'antd';
import Logo from '@/layouts/BaseLayout/Logo.tsx';
import UserDropdown from '@/layouts/BaseLayout/UserPopover.tsx';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import StructureLayout from '@/layouts/BaseLayout/StructureLayout.tsx';
import { useQuery } from '@apollo/client';
import { MeDocument } from '@/graphql/gen/graphql.ts';
import useUserStore from '@/store/userStore.ts';
import {css} from "@emotion/react";

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

const BaseLayout: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const {token} = theme.useToken();
  const { user, setUser,setUserSettings } = useUserStore();
  const loc = useLocation();
  const [pathname, setPathname] = React.useState(loc.pathname);
  const nav = useNavigate();
  useEffect(() => {
    nav({
      to: `/${pathname}`,
    });
  }, [pathname]);

  const { t } = useTranslation();

  const items: MenuItem[] = [
    getItem(t('menus.projects'), '', <FolderOutlined />),
    getItem(t('menus.settings'), 'settings', <SettingOutlined />),
  ];

  const { data: meData, error } = useQuery(MeDocument, {
    fetchPolicy: 'no-cache',
    skip: Boolean(user?.id),
    onCompleted: (data) => {
      setUser({
        id: data.me?.id,
        username: data.me?.username,
        email: data.me?.email,
        avatar:'',
        nickname:''
      });

      setUserSettings({
        theme:data.me?.settings.theme,
        language:data.me?.settings.language,
        defaultDimension:''
      });
    },
  });

  const notNeedStructureLayoutList = ['/login'];

  useEffect(() => {
    if (!notNeedStructureLayoutList.includes(pathname) && error) {
      nav({
        to: '/login',
      });
      setPathname('/login');
    }
  }, [error]);

  const [show, setShow] = React.useState(false);

  useEffect(() => {
    if (meData) {
      setShow(Boolean(meData.me));
    }
  }, [meData]);

  return (
    <div>
      {show && !notNeedStructureLayoutList.includes(pathname) && (
        <StructureLayout
          sidebar={
            <>
              <Logo />
              <Menu
                css={css`
                  background-color: ${token.colorBgElevated};
                `}
                onSelect={(item) => {
                  setPathname(item.key);
                }}
                style={{
                  flex: 1,
                }}
                selectedKeys={[pathname]}
                mode="inline"
                items={items}
              />
              <UserDropdown />
            </>
          }
        >
          {children}
        </StructureLayout>
      )}
      {notNeedStructureLayoutList.includes(pathname) && children}
    </div>
  );
};

export default BaseLayout;
