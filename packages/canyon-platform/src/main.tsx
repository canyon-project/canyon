import "dayjs/locale/zh-cn.js";
import "./useWorker.ts";
import "./i18n.ts";
import "antd/dist/reset.css";
import "./index.css";

import {
    ApolloClient,
    ApolloProvider,
    createHttpLink,
    InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";

// 创建一个error link来处理错误
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message: msg, locations, path }) => {
            console.error(
                `[GraphQL error]: msg: ${msg}, Location: ${locations}, Path: ${path}`,
            );
            message.error(`[GraphQL error]: msg: ${msg}, Path: ${path}`);
            if (
                msg === "Unauthorized" &&
                window.location.pathname !== "/oauth" &&
                window.location.pathname !== "/login"
            ) {
                localStorage.clear();
                window.location.href = "/login";
            }
            // 在这里你可以执行自定义的操作，比如显示错误提示
        });
    }
    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
        // 在这里你可以执行自定义的操作，比如显示网络错误提示
    }
});

// 创建一个http link来发送GraphQL请求
const httpLink = createHttpLink({
    uri: "/graphql", // 你的GraphQL API的URL

    headers: {
        Authorization: `Bearer ` + (localStorage.getItem("token") || ""),
    },
});

// 创建Apollo Client实例
const client = new ApolloClient({
    link: errorLink.concat(httpLink), // 将error link和http link组合起来
    cache: new InMemoryCache(),
});

if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </BrowserRouter>,
);
