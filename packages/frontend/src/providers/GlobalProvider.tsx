import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider, message, theme } from 'antd';
import {FC, useEffect, useMemo} from 'react';
import useUserStore from '@/store/userStore.ts';
import { useLocation } from '@tanstack/react-router';
import i18n from "@/i18n.ts";
const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const { darkAlgorithm } = theme;

// 创建一个http link来发送GraphQL请求
const httpLink = createHttpLink({
  uri: '/graphql', // 你的GraphQL API的URL
  headers: {
    Authorization: `Bearer ` + (localStorage.getItem('token') || ''),
  },
});

const GlobalProvider: FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const loc = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  const { token } = theme.useToken();

  // console.log(token.colorBgBase, 'token.colorBgBase');

  // 创建一个错误拦截器
  const errorLink = ApolloLink.from([
    new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        const { errors } = response;
        console.log(response);
        if (errors && errors.length > 0) {
          errors.forEach((error) => {
            setTimeout(() => {
              if (!window.location.pathname.includes('/login')) {
                messageApi.error(error.message); // 使用 Ant Design 的 message 组件显示错误信息
                console.log(error.message, loc.pathname); // 控制台打印错误信息
              }
            }, 100);
          });
        }
        return response;
      });
    }),
  ]);

  // 将错误拦截器和 httpLink 组合起来
  const link = errorLink.concat(httpLink);

  // 创建Apollo Client实例
  const client = new ApolloClient({
    link: link, // 将error link和http link组合起来
    cache: new InMemoryCache(),
  });

  const { userSettings } = useUserStore();

  const jisuanTheme = useMemo(()=>{
    let themeValue = userSettings?.theme;
    // 处理主题设置为 auto 的情况
    if (themeValue === 'auto') {
      themeValue = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeValue
  },[userSettings])

  useEffect(() => {
    setTimeout(() => {

      let themeValue = userSettings?.theme;
      // 处理主题设置为 auto 的情况
      if (themeValue === 'auto') {
        themeValue = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      document.documentElement.classList.toggle(
        'dark',
        themeValue === 'dark',
      );
      i18n.changeLanguage(userSettings?.language);
    }, 0);
  }, [userSettings]);
  return (
    <>
      <ApolloProvider client={client}>
        {contextHolder}
        <ConfigProvider
          locale={languages[userSettings.language]}
          theme={{
            token: {
              colorPrimary: '#0071c2',
            },
            algorithm: jisuanTheme === 'dark' ? [darkAlgorithm] : [],
          }}
        >
          {children}
        </ConfigProvider>
      </ApolloProvider>
    </>
  );
};

export default GlobalProvider;
