import { ConfigProvider } from 'antd';
import { useRoutes } from 'react-router-dom';

import routes from '~react-pages';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#287DFA',
        },
      }}
    >
      {useRoutes(routes)}
    </ConfigProvider>
  );
};

export default App;
