import {
  AppstoreOutlined,
  ExportOutlined,
  MoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Typography, theme } from "antd";
import type { FC, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppFooter from "@/components/app/footer.tsx";
import { useContent } from "@/contexts/AuthContent";
import LayoutPlaceholder from "@/layouts/LayoutPlaceholder";

const BasicLayout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, status, logout } = useContent();
  const userLoading = status === "loading";

  const handleLogout = async () => {
    await logout();
  };

  const selected = `/${location.pathname.split("/")[1] || "projects"}`;

  const formatBuildDateLabel = (iso: string, language: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const localeTag = language === "en" ? "en-US" : language === "ja" ? "ja-JP" : "zh-CN";
    return d.toLocaleDateString(localeTag, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 分区组件：构建信息（版本 / 构建时间）
  const SidebarBuildMeta: FC = () => {
    const dateLabel = __APP_BUILD_DATE__
      ? formatBuildDateLabel(__APP_BUILD_DATE__, i18n.language)
      : "";
    const rawVersion = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "";
    const version =
      rawVersion && rawVersion !== "undefined" && rawVersion.trim() !== "" ? rawVersion.trim() : "";
    const displayVersion = version.startsWith("v") ? version : version ? `v${version}` : "";
    const tagForUrl = version.startsWith("v") ? version : version ? `v${version}` : "";
    const releaseHref = tagForUrl
      ? `https://github.com/canyon-project/canyon/releases/tag/${encodeURIComponent(tagForUrl)}`
      : "https://github.com/canyon-project/canyon/releases";

    return (
      <div
        className="flex-shrink-0 px-3 py-2"
        style={{ borderTop: `1px solid ${token.colorBorder}` }}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }} className="inline">
          <span className="whitespace-nowrap">
            {t("layout.builtOn")}
            {dateLabel ? <> {dateLabel}</> : null}
            {displayVersion ? (
              <>
                <span className="mx-1">·</span>
                <a
                  href={releaseHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("layout.openRelease")}
                  className="inline-flex items-center gap-0.5 underline underline-offset-2"
                  style={{ color: token.colorLink }}
                >
                  {displayVersion}
                  <ExportOutlined style={{ fontSize: 11 }} />
                </a>
              </>
            ) : null}
          </span>
        </Typography.Text>
      </div>
    );
  };

  // 分区组件：侧边头部（Logo 与标题）
  const SidebarHeader: FC = () => (
    <div className={"px-3 py-[16px] flex items-center justify-between"}>
      <div className={"cursor-pointer flex items-center"} style={{ marginBottom: 0 }} onClick={()=>{
        window.location.href = "/";
      }}>
        <img src="/logo.svg" className={"w-[36px]"} alt="" />
        <span
          className={"ml-[6px]"}
          style={{
            fontSize: "18px",
            fontWeight: "bolder",
          }}
        >
          Canyon
        </span>
      </div>

      <LayoutPlaceholder />
    </div>
  );

  // 分区组件：侧边菜单
  const SidebarMenu: FC = () => (
    <Menu
      className={"flex-1"}
      mode="inline"
      selectedKeys={[selected]}
      items={[
        {
          key: "/projects",
          icon: <AppstoreOutlined />,
          label: <Link to="/projects">{t("menus.projects")}</Link>,
          onClick: () => navigate("/projects"),
        },
        {
          key: "/settings",
          icon: <SettingOutlined />,
          label: <Link to="/settings">{t("menus.settings")}</Link>,
          onClick: () => navigate("/settings"),
        },
      ]}
    />
  );

  // 分区组件：用户信息与操作
  const SidebarUser: FC = () => (
    <div className="border-t" style={{ borderColor: token.colorBorder }}>
      <div className="h-[77px] py-2 px-2 flex items-center justify-between">
        {userLoading ? (
          <div className="flex items-center gap-3">
            <Avatar size={32}>...</Avatar>
            <Typography.Text type="secondary">加载中</Typography.Text>
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar size={32} src={user.avatar || "default-avatar.svg"} alt={user.nickname} />
              <div className="flex flex-col min-w-0">
                <Typography.Text ellipsis>{user.nickname}</Typography.Text>
                <Typography.Text ellipsis type="secondary" style={{ fontSize: 12 }}>
                  {user.email}
                </Typography.Text>
              </div>
            </div>
            <Dropdown
              menu={{
                items: [{ key: "logout", label: t("退出登录") || "退出登录" }],
                onClick: async ({ key }) => {
                  if (key === "logout") {
                    await handleLogout();
                  }
                },
              }}
            >
              <MoreOutlined className="cursor-pointer" />
            </Dropdown>
          </>
        ) : (
          <div className="w-full flex items-center gap-3">
            <Avatar size={32}>?</Avatar>
            <div className="flex flex-col">
              <Typography.Text type="secondary" className="w-[150px]" ellipsis>
                未登录
              </Typography.Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen flex">
      <div
        className={"w-[260px] h-[100vh] overflow-hidden flex flex-col"}
        style={{
          borderRight: `1px solid ${token.colorBorder}`,
        }}
      >
        <SidebarHeader />

        <div
          className={"mb-1"}
          style={{
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        />

        <SidebarMenu />

        <SidebarBuildMeta />

        <SidebarUser />
      </div>
      <div className={"flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] h-[100vh] overflow-auto"}>
        <div className={"m-auto max-w-[1200px] min-w-[1000px] p-[12px] min-h-[100vh]"}>
          <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>{children}</ErrorBoundary>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        <div className="m-auto max-w-[1200px] min-w-[1000px]">
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default BasicLayout;
