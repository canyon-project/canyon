// import { css } from '@emotion/react';
import { ConfigProvider } from 'antd';

import AppFooter from './components/app/footer.tsx';
import AppHeader from './components/app/header.tsx';
import AppMain from './components/app/main.tsx';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0071c2',
        },
      }}
    >
      <div
        className={'w-[500px]'}
      >
        <AppHeader />
        <AppMain/>
        <AppFooter />
      </div>
    </ConfigProvider>
  );
}

export default App;
