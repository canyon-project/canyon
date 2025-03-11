import type React from 'react';
import styled from '@emotion/styled';
import { Divider } from 'antd';
import AppFooter from '@/layouts/BaseLayout/Footer.tsx';
import type { GlobalToken } from 'antd/es/theme/interface';

// Define the styled components
const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }: { theme: GlobalToken | any }) =>
    theme.colorBgBase};
`;

const Sidebar = styled.div`
  width: 240px;
  background-color: ${({ theme }: { theme: GlobalToken | any }) =>
    theme.colorBgElevated};
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid
    ${({ theme }: { theme: GlobalToken | any }) => theme.colorBorderSecondary};
`;

const Content = styled.div`
  flex: 1;
  margin-left: 240px;
  background-color: ${({ theme }: { theme: GlobalToken|any }) => {
    return theme.colorBgContainer;
  }};
`;

// Define the props interface
interface StructureLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

// Create the StructureLayout component
export default function StructureLayout({
  sidebar,
  children,
}: StructureLayoutProps) {
  return (
    <Container>
      <Sidebar>{sidebar}</Sidebar>
      <Content>
        <div>{children}</div>
        <Divider style={{ margin: '0' }} />
        <AppFooter />
      </Content>
    </Container>
  );
}
