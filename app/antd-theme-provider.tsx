"use client";

import React from "react";
import { ConfigProvider } from "antd";

type AntdThemeProviderProps = {
  children: React.ReactNode;
};

export default function AntdThemeProvider({ children }: AntdThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          // 全局主题主色，按需修改为你的品牌色
          colorPrimary: "#0071c2",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}


