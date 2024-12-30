import {
    ArrowRightOutlined,
    FolderOutlined,
    LogoutOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import axios from "axios";
import { useTranslation } from "react-i18next";

import book from "../assets/book.svg";
import {
    CanyonLayoutBase,
    CanyonModalGlobalSearch,
} from "../components/old-ui";
import { MeDocument } from "../helpers/backend/gen/graphql.ts";
import { genBreadcrumbItems } from "../layouts/genBreadcrumbItems.tsx";
import { genTitle } from "../layouts/genTitle.ts";
const theme = localStorage.getItem("theme") || "light";
// console.log(theme, 'theme');
function Index() {
    const { t } = useTranslation();
    const loc = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        setMenuSelectedKey(loc.pathname.replace("/", ""));
        document.title = genTitle(loc.pathname);
        if (localStorage.getItem("token") === null) {
            localStorage.clear();
            localStorage.setItem("callback", window.location.href);
            nav("/login");
        } else if (loc.pathname === "/"){
            nav("/projects");
        }
    }, [loc.pathname]);

    const { data: meData } = useQuery(MeDocument);
    useEffect(() => {
        localStorage.setItem("username", meData?.me.email || "");
    }, [meData]);
    const { data: baseData } = useRequest(
        () => axios.get("/api/base").then(({ data }) => data),
        {
            onSuccess(data) {
                // @ts-ignore
                window.GITLAB_URL = data.GITLAB_URL;
            },
        },
    );
    const [menuSelectedKey, setMenuSelectedKey] = useState<string>("projects");
    // @ts-ignore
    window.canyonModalGlobalSearchRef = useRef(null);
    return (
        <>
            {/*<GlobaScreenWidthLimitModal />*/}
            <CanyonLayoutBase
                breadcrumb={
                    <div>
                        {/*榜单mark*/}
                        <Breadcrumb
                            className={"py-3"}
                            items={genBreadcrumbItems(loc.pathname)}
                        />
                    </div>
                }
                itemsDropdown={[
                    {
                        label: (
                            <div className={"text-red-500"}>
                                <LogoutOutlined className={"mr-2"} />
                                Logout
                            </div>
                        ),
                        onClick: () => {
                            localStorage.clear();
                            window.location.href = "/login";
                        },
                    },
                ]}
                MeData={meData}
                onClickGlobalSearch={() => {
                    // @ts-ignore
                    window.canyonModalGlobalSearchRef.current.report();
                }}
                title={"Canyon"}
                logo={
                    <div>
                        <img
                            src={`/${theme}-logo.svg?a=1`}
                            alt=""
                            className={"w-[32px]"}
                        />
                    </div>
                }
                mainTitleRightNode={
                    <div>
                        <Tooltip
                            title={
                                <div>
                                    <span>{t("menus.docs")}</span>
                                    <ArrowRightOutlined />
                                </div>
                            }
                        >
                            <a
                                href={baseData?.SYSTEM_QUESTION_LINK}
                                target={"_blank"}
                                rel="noreferrer"
                                className={"ml-2"}
                            >
                                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                <img src={book} />
                            </a>
                        </Tooltip>
                        {/*marker position*/}
                    </div>
                }
                menuSelectedKey={menuSelectedKey}
                onSelectMenu={(selectInfo) => {
                    setMenuSelectedKey(selectInfo.key);
                    nav(`/${selectInfo.key}`);
                }}
                menuItems={[
                    {
                        label: t("menus.projects"),
                        key: "projects",
                        icon: <FolderOutlined />,
                    },
                    // {
                    //   label: t("报表"),
                    //   key: "reports",
                    //   icon: <BarChartOutlined />,
                    // },
                    {
                        label: t("menus.settings"),
                        key: "settings",
                        icon: <SettingOutlined />,
                    },
                ]}
                renderMainContent={<Outlet />}
                search={false}
                account={false}
            />
            {/*// @ts-ignore*/}
            <CanyonModalGlobalSearch ref={canyonModalGlobalSearchRef} />
        </>
    );
}

export default Index;
