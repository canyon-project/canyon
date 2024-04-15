import { ConfigProvider, theme } from 'antd';
import { useRoutes } from 'react-router-dom';

import routes from '~react-pages';
const { darkAlgorithm } = theme;
const App = () => {
  const isDark = localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : false;
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#287DFA',
        },
        algorithm: isDark ? [darkAlgorithm] : [],
      }}
    >
      {useRoutes(routes)}
    </ConfigProvider>
  );
};

export default App;
