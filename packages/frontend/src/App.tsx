import { ConfigProvider, message, theme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { useRoutes } from 'react-router-dom';
import CoverageReport from '@/independents/report/index.tsx';
import routes from '~react-pages';
import { AuthLayer } from '@/providers/AuthLayer';

const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const lng = (localStorage.getItem('language') || 'cn') as keyof typeof languages;

const { darkAlgorithm } = theme;

routes.push({
  path: '/report/-/:provider/:org/:repo/:subject/:subjectID/-*',
  element: <CoverageReport />,
});

message.config({});

const App = () => {
  const isDark =
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && false);

  return (
    <ConfigProvider
      locale={languages[lng]}
      theme={{
        token: {
          colorPrimary: '#0071c2',
        },
        algorithm: isDark ? [darkAlgorithm] : [],
      }}
    >
      <AuthLayer>{useRoutes(routes)}</AuthLayer>
    </ConfigProvider>
  );
};

export default App;
