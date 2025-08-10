import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { useRoutes } from 'react-router-dom';

import routes from '~react-pages';
import { ConfigProvider, theme } from 'antd';
import CoverageReport from "@/components/CoverageReport.tsx";
const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const lng = (localStorage.getItem('language') ||
  'cn') as keyof typeof languages;

const { darkAlgorithm } = theme;

// /report/-/gitlab/canyon-project/canyon-demo/pulls/9/-/src/App.tsx

routes.push({
  path:'/report/-/:provider/:org/:repo/:subject/:subjectID/-*',
  element: <CoverageReport/>
})

console.log(routes, 'routes');
const App = () => {
  const isDark = localStorage.getItem('theme')
    ? localStorage.getItem('theme') === 'dark'
    : false;
  return (
    <ConfigProvider
      locale={languages[lng]}
      theme={{
        token: {
          colorPrimary: '#0071c2',
          borderRadius: 2,
        },
        algorithm: isDark ? [darkAlgorithm] : [],
      }}
    >
      {useRoutes(routes)}
    </ConfigProvider>
  );
};

export default App;
