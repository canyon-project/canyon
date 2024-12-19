import enUS from "antd/es/locale/en_US";
import jaJP from "antd/es/locale/ja_JP";
import zhCN from "antd/es/locale/zh_CN";
import { useRoutes } from "react-router-dom";

import routes from "~react-pages";
import Sha from "@/pages/index/projects/[id]/commits/[sha].tsx";

routes.push({
    element: <Sha />,
    path: "/open-projects/:id/commits/:sha",
});

const languages = {
    cn: zhCN,
    en: enUS,
    ja: jaJP,
};

const lng = (localStorage.getItem("language") ||
    "cn") as keyof typeof languages;

const { darkAlgorithm } = theme;
const App = () => {
    const isDark = localStorage.getItem("theme")
        ? localStorage.getItem("theme") === "dark"
        : false;
    return (
        <div className={"dark:text-white dark:text-opacity-85"}>
            <ConfigProvider
                locale={languages[lng]}
                theme={{
                    token: {
                        colorPrimary: "#0071c2",
                    },
                    algorithm: isDark ? [darkAlgorithm] : [],
                }}
            >
                {useRoutes(routes)}
            </ConfigProvider>
        </div>
    );
};

export default App;
