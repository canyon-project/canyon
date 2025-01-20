import {
  BarChartOutlined,
  LinkOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { FC, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CanyonCardPrimary } from "../card";
import Footer from "./footer.tsx";
import ScrollBasedLayout from "./ScrollBasedLayout.tsx";

const { useToken } = theme;
const { Text, Title } = Typography;
interface CanyonLayoutBaseProps {
  title?: string;
  logo?: ReactNode;
  mainTitleRightNode?: ReactNode;
  menuSelectedKey?: string;
  onSelectMenu?: (selectInfo: { key: string }) => void;
  menuItems: MenuProps["items"];
  renderMainContent?: ReactNode;
  onClickGlobalSearch?: () => void;
  MeData: any;
  itemsDropdown: any;
  search: any;
  account: any;
  breadcrumb: any;
  footerName?: string;
}
const CanyonLayoutBase: FC<CanyonLayoutBaseProps> = ({
  title = "Canyon",
  logo,
  mainTitleRightNode,
  menuSelectedKey = "",
  onSelectMenu,
  menuItems,
  renderMainContent,
  onClickGlobalSearch,
  MeData,
  itemsDropdown,
  search,
  account,
  breadcrumb,
  footerName = "CANYON",
}) => {
  const { token } = useToken();

  return (
    <div>
      <>
        <ScrollBasedLayout
          sideBar={
            <div
              className={"w-[260px] h-[100vh] overflow-hidden flex flex-col"}
              style={{
                borderRight: `1px solid ${token.colorBorder}`,
              }}
            >
              <div className={"px-3 py-[16px]"}>
                <div className={"flex items-center justify-between"}>
                  <div
                    className={"cursor-pointer flex items-center"}
                    style={{ marginBottom: 0 }}
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  >
                    {logo}
                    <span
                      className={"ml-[6px]"}
                      style={{
                        fontSize: "18px",
                        fontWeight: "bolder",
                      }}
                    >
                      {title}
                    </span>
                  </div>

                  <div>{mainTitleRightNode}</div>
                </div>
              </div>

              <div
                className={"mb-1"}
                style={{
                  borderBottom: `1px solid ${token.colorBorder}`,
                }}
              />

              <Menu
                onSelect={(selectInfo) => {
                  onSelectMenu?.(selectInfo);
                }}
                selectedKeys={[menuSelectedKey]}
                items={menuItems.concat({
                  key: "open-reports",
                  icon: <BarChartOutlined />,
                  label: (
                    <a href="/open-reports" rel="noopener noreferrer">
                      报表
                    </a>
                  ),
                })}
                className={"dark:bg-[#151718] px-1"}
                style={{ flex: "1" }}
              />
              <Dropdown
                menu={{
                  items: itemsDropdown,
                  onClick: () => {},
                }}
              >
                <div
                  className={
                    "h-[77px] py-[16px] px-[16px] flex items-center justify-between cursor-pointer"
                  }
                  style={{
                    borderTop: `1px solid ${token.colorBorder}`,
                  }}
                >
                  <Avatar src={MeData?.me.avatar}></Avatar>
                  <div className={"flex flex-col"}>
                    <Text ellipsis className={"w-[150px]"}>
                      {MeData?.me.nickname}
                    </Text>
                    <Text ellipsis className={"w-[150px]"} type={"secondary"}>
                      {MeData?.me.email || ""}
                    </Text>
                  </div>
                  <MoreOutlined className={"dark:text-[#fff]"} />
                </div>
              </Dropdown>
            </div>
          }
          mainContent={
            <div
              className={"flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]"}
            >
              <div className={"m-auto max-w-[1200px] min-w-[1000px] px-[12px]"}>
                {breadcrumb}
              </div>
              <div className={"m-auto max-w-[1200px] min-w-[1000px] p-[12px]"}>
                <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
                  {renderMainContent}
                </ErrorBoundary>
              </div>
            </div>
          }
          footer={<Footer name={footerName} corp={"Trip.com"} />}
        />
      </>
    </div>
  );
};

export default CanyonLayoutBase;
