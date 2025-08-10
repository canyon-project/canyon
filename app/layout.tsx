import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AntdThemeProvider from './antd-theme-provider';
import './globals.css';

const RootLayout = ({ children }: React.PropsWithChildren) => (
    <html lang="en">
    <body>
    <AntdRegistry>
      <AntdThemeProvider>{children}</AntdThemeProvider>
    </AntdRegistry>
    </body>
    </html>
);

export default RootLayout;