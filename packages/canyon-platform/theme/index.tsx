"use client";

import React, { useEffect, useState } from "react";
import { ConfigProvider, theme } from "antd";
const { darkAlgorithm } = theme;
const WithTheme = (node: JSX.Element) => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const _isDark = localStorage.getItem("theme")
      ? localStorage.getItem("theme") === "dark"
      : false;
    setIsDark(_isDark);
    if (_isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0071c2",
          },
          algorithm: isDark ? [darkAlgorithm] : [],
        }}
      >
        {node}
      </ConfigProvider>
    </>
  );
};

export default WithTheme;
