import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { useRoutes } from 'react-router-dom';

import routes from '~react-pages';
import { ConfigProvider, theme } from 'antd';
const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const lng = (localStorage.getItem('language') ||
  'cn') as keyof typeof languages;

const { darkAlgorithm } = theme;

console.log(routes, 'routes');
const App = () => {
  const isDark = localStorage.getItem('theme')
    ? localStorage.getItem('theme') === 'dark'
    : false;
  return (
    <div>
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
    </div>
  );
};

export default App;
