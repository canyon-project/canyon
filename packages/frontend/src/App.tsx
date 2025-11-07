import { ConfigProvider, message, theme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import jaJP from 'antd/es/locale/ja_JP';
import zhCN from 'antd/es/locale/zh_CN';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
// import CoverageReport from '@/components/CoverageReport.tsx';
import routes from '~react-pages';

const languages = {
  cn: zhCN,
  en: enUS,
  ja: jaJP,
};

const lng = (localStorage.getItem('language') ||
  'cn') as keyof typeof languages;

const { darkAlgorithm } = theme;

message.config({});

const App = () => {
  const isDark = localStorage.getItem('theme')
    ? localStorage.getItem('theme') === 'dark'
    : false;
  const location = useLocation();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      if (raw) {
        setAuthed(true);
        return;
      }
    } catch {}
    (async () => {
      try {
        const resp = await fetch(`/auth/me`, { credentials: 'include' });
        if (resp.ok) {
          const me = await resp.json();
          if (me?.id) {
            setAuthed(true);
            return;
          }
        }
      } catch {}
      setAuthed(false);
    })();
  }, []);

  const element = useRoutes(routes);

  if (location.pathname === '/login') {
    if (authed) return <Navigate to='/' replace />;
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
        {element}
      </ConfigProvider>
    );
  }

  if (authed === null) return null;
  if (!authed) return <Navigate to='/login' replace />;

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
      {element}
    </ConfigProvider>
  );
};

export default App;
