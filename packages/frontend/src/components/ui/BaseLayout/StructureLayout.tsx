import { Divider } from 'antd';
import { theme } from 'antd';
import type React from 'react';
import AppFooter from './Footer';

// Define the props interface
interface StructureLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

// Define the props interface
interface StructureLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

// Create the StructureLayout component
export default function StructureLayout({ sidebar, children }: StructureLayoutProps) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: token.colorBgBase,
      }}
    >
      <div
        style={{
          width: '240px',
          backgroundColor: token.colorBgElevated,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {sidebar}
      </div>
      <div
        style={{
          flex: 1,
          marginLeft: '240px',
          backgroundColor: token.colorBgContainer,
        }}
      >
        <div>{children}</div>
        <Divider style={{ margin: '0' }} />
        <AppFooter />
      </div>
    </div>
  );
}
