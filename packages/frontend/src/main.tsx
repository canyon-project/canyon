import './useWorker.ts'
// import { StrictMode } from 'react'
import './i18n.ts'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

// 创建一个http link来发送GraphQL请求
const httpLink = createHttpLink({
  uri: "/graphql", // 你的GraphQL API的URL

  headers: {
    Authorization: `Bearer ` + (localStorage.getItem("token") || ""),
  },
});

// 创建Apollo Client实例
const client = new ApolloClient({
  link: httpLink, // 将error link和http link组合起来
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
)
