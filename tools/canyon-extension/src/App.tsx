import { css } from '@emotion/react';
import { ConfigProvider } from 'antd';

import AppFooter from './components/app/footer.tsx';
import AppHeader from './components/app/header.tsx';
import AppMain from './components/app/main.tsx';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3264ff',
        },
      }}
    >
      <div
        css={css`
          width: 500px;
        `}
      >
        <AppHeader />
        <AppMain></AppMain>
        <AppFooter />
      </div>
    </ConfigProvider>
  );
}

export default App;
