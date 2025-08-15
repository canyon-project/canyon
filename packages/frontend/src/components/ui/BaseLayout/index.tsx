import { Menu, type MenuProps, theme } from 'antd';
import type React from 'react';
import Logo from './Logo';
import StructureLayout from './StructureLayout';
type MenuItem = Required<MenuProps>['items'][number];

function noop(v: string) {
  console.log(v);
}
export const BaseLayout: React.FC<{
  children?: React.ReactNode;
  logo?: React.ReactNode;
  menuItems: MenuItem[];
  onChange?: (value: string) => void;
  value?: string;
}> = ({ children, logo, menuItems = [], value = '', onChange = noop }) => {
  const { token } = theme.useToken();
  return (
    <div>
      <StructureLayout
        sidebar={
          <>
            <Logo logo={logo} />
            <Menu
              style={{
                flex: 1,
                backgroundColor: token.colorBgElevated,
              }}
              onSelect={(item) => {
                // console.log(item)
                onChange(item.key as string);
              }}
              selectedKeys={[value]}
              mode='inline'
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
