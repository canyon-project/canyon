import {
  FundProjectionScreenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Typography } from "antd";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/coverage", icon: <FundProjectionScreenOutlined />, label: "Coverage" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-full">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        className="!fixed left-0 top-0 z-10 h-screen"
      >
        <div className="flex h-16 items-center justify-center px-4">
          <Typography.Title level={5} className="!m-0 !text-white">
            {collapsed ? "C" : "Canyon"}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={["/coverage"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout
        className={`min-h-screen transition-[margin] ${collapsed ? "ml-[80px]" : "ml-[220px]"}`}
      >
        <Header
          className="sticky top-0 z-[9] flex items-center px-6 shadow-sm"
          style={{ background: colorBgContainer }}
        >
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-lg text-neutral-700"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "展开菜单" : "收起菜单"}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Header>
        <Content className="m-4">
          <div
            className="min-h-[calc(100vh-7rem)] p-6"
            style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
