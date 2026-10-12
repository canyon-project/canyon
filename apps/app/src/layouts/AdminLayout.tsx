import {
  DashboardOutlined,
  FundProjectionScreenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, theme, Typography } from "antd";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/", icon: <DashboardOutlined />, label: "工作台" },
  { key: "/coverage", icon: <FundProjectionScreenOutlined />, label: "Coverage" },
  { key: "/users", icon: <TeamOutlined />, label: "用户管理" },
  { key: "/settings", icon: <SettingOutlined />, label: "系统设置" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedKey = useMemo(() => {
    const match = menuItems.find(
      (item) => item.key !== "/" && location.pathname.startsWith(item.key),
    );
    return match?.key ?? "/";
  }, [location.pathname]);

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
            {collapsed ? "后台" : "企业管理后台"}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout
        className={`min-h-screen transition-[margin] ${collapsed ? "ml-[80px]" : "ml-[220px]"}`}
      >
        <Header
          className="sticky top-0 z-[9] flex items-center justify-between px-6 shadow-sm"
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
          <div className="flex items-center gap-3">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="text-sm text-neutral-600">管理员</span>
          </div>
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
