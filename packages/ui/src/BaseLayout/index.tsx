import React from 'react';
import { FolderOutlined, SettingOutlined } from '@ant-design/icons';
import {Menu, MenuProps, theme} from 'antd';
import Logo from './Logo';
import StructureLayout from './StructureLayout';
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
function noop(v:string) {
  console.log(v)
}
export const BaseLayout: React.FC<{
  children?: React.ReactNode;
  logo?: React.ReactNode;
  menuItems: MenuItem[];
  onChange?: (value: string) => void;
  value?: string;
}> = ({ children,logo,menuItems=[],value='',onChange=noop }) => {
  const {token} = theme.useToken();
  return (
    <div>
      <StructureLayout
        sidebar={
          <>
            <Logo logo={logo} />
            <Menu
              style={{
                flex: 1,
                backgroundColor: token.colorBgElevated
              }}
              onSelect={(item) => {
                // console.log(item)
                onChange(item.key as string);
              }}
              selectedKeys={[value]}
              mode="inline"
              items={menuItems}
            />
          </>
        }
      >
        {children}
      </StructureLayout>
    </div>
  );
};
