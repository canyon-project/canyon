import { ConfigProvider, theme } from 'antd';
import { useRoutes } from 'react-router-dom';

import routes from '~react-pages';
import zhCN from "antd/es/locale/zh_CN";

const { darkAlgorithm } = theme;
const App = () => {
  const isDark = localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : false;
  return (
    <div className={'dark:text-white dark:text-opacity-85'}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#0071c2',
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
