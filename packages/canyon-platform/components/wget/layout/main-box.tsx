"use client";
import ScrollBasedLayout from "@/components/wget/layout/scroll-based-layout";
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Menu,
  theme,
  Typography,
} from "antd";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useMemo } from "react";
// import Link from "next/link";
// import CIcon from "@/components/c-icon";
import AppFooter from "@/components/wget/layout/app-footer";
import Link from "next/link";
import useSWR from "swr";

const menuItems = [
  {
    label: "Projects",
    key: "projects",
    // icon: <FolderOutlined />,
  },
  // {
  //   label: t("报表"),
  //   key: "reports",
  //   icon: <BarChartOutlined />,
  // },
  {
    label: "Settings",
    key: "settings",
    // icon: <SettingOutlined />,
  },
];
const { Text, Title } = Typography;
const itemsDropdown: any = [
  {
    label: (
      <div className={"text-red-500"}>
        {/*<LogoutOutlined className={"mr-2"} />*/}
        Logout
      </div>
    ),
    onClick: () => {
      localStorage.clear();
      window.location.href = "/login";
    },
  },
];

const MeData = {
  me: {
    nickname: "admin",
    email: "zzz@t.com",
    avatar: "https://avatars.githubusercontent.com/u/20411648?v=4",
  },
};
const { useToken } = theme;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MainBoxWrap = ({ children }: React.PropsWithChildren) => {
  const routeName = usePathname();
  const { data, error } = useSWR("/api/user", fetcher);
  const { id, sha } = useParams(); // 获取动态路由参数
  const { token } = useToken();
  const onSelectMenu = (selectInfo: any) => {
    console.log(selectInfo);
    window.location.href = `/${selectInfo.key}`;
  };

  const selectedKey = usePathname().split("/")[1];

  // const BreadcrumbItems = []

  const breadcrumbItems = useMemo(() => {
    // return []
    if (id && !sha) {
      return [
        {
          title: <Link href={`/projects`}>Projects</Link>,
        },
        {
          title: "Overview",
        },
      ];
    } else if (id && sha) {
      return [
        {
          title: <Link href={`/projects`}>Projects</Link>,
        },
        {
          title: <Link href={`/projects/tripgl/${id}/auto`}>Overview</Link>,
        },
        {
          title: "Coverage Details",
        },
      ];
    } else {
      return [];
    }
  }, [id, sha]);

  return (
    <ScrollBasedLayout
      sideBar={
        <div
          className={"w-[240px] h-[100vh] overflow-hidden flex flex-col"}
          style={{ borderRight: "1px solid #d9d9d9" }}
        >
          <div className={"px-3 py-[14px]"}>
            <div className={"flex items-center justify-between"}>
              <div
                className={"cursor-pointer flex items-center"}
                style={{ marginBottom: 0 }}
                onClick={() => {
                  window.location.href = "/projects";
                }}
              >
                <Image src={"/logo.svg"} alt={"logo"} width={30} height={30} />
                <span
                  className={"ml-[6px]"}
                  style={{ fontSize: "18px", fontWeight: "bolder" }}
                >
                  {"Canyon"}
                </span>
              </div>

              {/*<Link href={"https://docs.canyonjs.org/"} target={"_blank"}>*/}
              {/*  /!*<span className="icon-[nrk--media-programguide]"/>*!/*/}
              {/*  /!*<CIcon name={"nrk--media-programguide"} />*!/*/}
              {/*</Link>*/}
            </div>
          </div>

          <div
            className={"mb-1"}
            style={{
              borderBottom: `1px solid ${"#d9d9d9"}`,
            }}
          />
          <Menu
            // activeKey={"projects"}
            onSelect={(selectInfo) => {
              onSelectMenu?.(selectInfo);
            }}
            selectedKeys={[routeName.split("/")[1]]}
            items={menuItems}
            className={"dark:bg-[#151718] px-1"}
            style={{ flex: "1" }}
          />

          <div className={"px-[8px] flex gap-2 flex-col mb-6"}>
            <Button
              size={"small"}
              style={{
                justifyContent: "flex-start",
                fontSize: "13px",
              }}
              className={"w-[100%]"}
              color="default"
              variant="text"
              icon={<span className="icon-[proicons--book]"></span>}
            >
              Documentation
            </Button>
            <Button
              size={"small"}
              style={{
                justifyContent: "flex-start",
                fontSize: "13px",
              }}
              className={"w-[100%]"}
              color="default"
              variant="text"
              icon={<span className="icon-[heroicons-outline--support]"></span>}
            >
              Support
            </Button>
          </div>
          <Dropdown
            menu={{
              items: itemsDropdown,
              onClick: () => {},
            }}
          >
            <div
              className={
                "h-[70px] py-[10px] px-[10px] flex items-center justify-between cursor-pointer"
              }
              style={{ borderTop: `1px solid ${token.colorBorder}` }}
            >
              <Avatar src={data?.image}></Avatar>
              <div className={"flex flex-col"}>
                <Text ellipsis className={"w-[150px]"}>
                  {data?.name}
                </Text>
                <Text
                  ellipsis
                  className={"w-[150px]"}
                  style={{ fontSize: "12px" }}
                  type={"secondary"}
                >
                  {data?.email || ""}
                </Text>
              </div>
              {/*<CIcon name={"nrk--more"} />*/}
              <span className="icon-[nrk--more]"></span>
              {/*<MoreOutlined className={"dark:text-[#fff]"} />*/}
            </div>
          </Dropdown>
        </div>
      }
      mainContent={
        <div className={"flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]"}>
          <div className={"m-auto max-w-[1230px] min-w-[1000px] p-[12px]"}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className={"m-auto max-w-[1230px] min-w-[1000px] p-[12px]"}>
            {children}
          </div>
        </div>
      }
      footer={<AppFooter name={`Trip.com`} corp={"Trip.com"} />}
    />
  );
};
const MainBox = ({ children }: React.PropsWithChildren) => {
  return (
    <div>
      <MainBoxWrap>{children}</MainBoxWrap>
    </div>
  );
};

export default MainBox;
