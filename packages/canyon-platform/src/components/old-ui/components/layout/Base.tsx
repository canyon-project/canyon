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
                            className={
                                "w-[260px] h-[100vh] overflow-hidden flex flex-col"
                            }
                            style={{
                                borderRight: `1px solid ${token.colorBorder}`,
                            }}
                        >
                            <div className={"px-3 py-[16px]"}>
                                <div
                                    className={
                                        "flex items-center justify-between"
                                    }
                                >
                                    <div
                                        className={
                                            "cursor-pointer flex items-center"
                                        }
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
                            {search && (
                                <div className={"px-2"}>
                                    <CanyonCardPrimary>
                                        <Button
                                            type="text"
                                            className={"w-full"}
                                            onClick={() => {
                                                onClickGlobalSearch?.();
                                            }}
                                        >
                                            <div
                                                className={
                                                    "flex justify-between"
                                                }
                                            >
                                                <SearchOutlined />
                                                <Text>Search</Text>

                                                <div className={"inline-block"}>
                                                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                                                        ⌘
                                                    </kbd>
                                                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                                                        K
                                                    </kbd>
                                                </div>
                                            </div>
                                        </Button>
                                    </CanyonCardPrimary>
                                </div>
                            )}

                            {account && (
                                <div className={"px-2 flex flex-col mb-3"}>
                                    <Text
                                        type={"secondary"}
                                        style={{ fontSize: "10px" }}
                                    >
                                        Account
                                    </Text>
                                    <CanyonCardPrimary>
                                        <Select
                                            variant={"borderless"}
                                            defaultValue="lucy"
                                            style={{ width: "100%" }}
                                            options={[
                                                {
                                                    label: "Personal account",
                                                    options: [
                                                        {
                                                            label: "Jack",
                                                            value: "jack",
                                                        },
                                                        {
                                                            label: "Lucy",
                                                            value: "lucy",
                                                        },
                                                    ],
                                                },
                                                {
                                                    label: "Organizations",
                                                    options: [
                                                        {
                                                            label: "yiminghe",
                                                            value: "Yiminghe",
                                                        },
                                                    ],
                                                },
                                            ]}
                                        />
                                    </CanyonCardPrimary>
                                </div>
                            )}

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
                                items={menuItems}
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
                                        <Text
                                            ellipsis
                                            className={"w-[150px]"}
                                            type={"secondary"}
                                        >
                                            {MeData?.me.email || ""}
                                        </Text>
                                    </div>
                                    <MoreOutlined
                                        className={"dark:text-[#fff]"}
                                    />
                                </div>
                            </Dropdown>
                        </div>
                    }
                    mainContent={
                        <div
                            className={
                                "flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]"
                            }
                        >
                            <div
                                className={
                                    "m-auto max-w-[1200px] min-w-[1000px] px-[12px]"
                                }
                            >
                                {breadcrumb}
                            </div>
                            <div
                                className={
                                    "m-auto max-w-[1200px] min-w-[1000px] p-[12px]"
                                }
                            >
                                <ErrorBoundary
                                    fallback={<p>⚠️Something went wrong</p>}
                                >
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
