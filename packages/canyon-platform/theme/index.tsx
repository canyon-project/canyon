"use client";

import React from "react";
import { ConfigProvider } from "antd";

const withTheme = (node: JSX.Element) => (
  <>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0071c2",
        },
      }}
    >
      {node}
    </ConfigProvider>
  </>
);

export default withTheme;
