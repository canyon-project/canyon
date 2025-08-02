import {ConfigProvider, theme} from "antd";
import enUS from "antd/es/locale/en_US";
import jaJP from "antd/es/locale/ja_JP";
import zhCN from "antd/es/locale/zh_CN";
import { useRoutes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

import routes from "~react-pages";
console.log(routes,'routes')
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
        <ErrorBoundary>
            <AuthProvider>
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
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
