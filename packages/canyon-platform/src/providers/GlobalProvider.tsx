import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider, theme } from 'antd';
import { FC, useEffect, useState } from 'react';
const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const { darkAlgorithm } = theme;

const GlobalProvider: FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [data, setData] = useState<{
    language: keyof typeof languages;
    theme: 'light' | 'dark';
  } | null>(null);
  useEffect(() => {
    setTimeout(() => {
      setData({ theme: 'light', language: 'cn' });

      // On page load or when changing themes, best to add inline in `head` to avoid FOUC
      document.documentElement.classList.toggle('dark', false);
    }, 100);
  }, []);
  return (
    <>
      {data && (
        <ConfigProvider
          locale={languages[data.language]}
          theme={{
            token: {
              colorPrimary: '#0071c2',
            },
            algorithm: data.theme === 'dark' ? [darkAlgorithm] : [],
          }}
        >
          {children}
        </ConfigProvider>
      )}
    </>
  );
};

export default GlobalProvider;
