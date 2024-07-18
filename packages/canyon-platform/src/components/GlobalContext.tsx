// src/context/GlobalContext.js

import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import { createContext, useEffect, useReducer } from 'react';

const getSystemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const getSystemLocale = () => (navigator.language.startsWith('zh') ? zhCN : enUS);

const initialState = {
  theme: getSystemTheme(),
  locale: getSystemLocale(),
};

const GlobalContext = createContext();

const globalReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_LOCALE':
      return {
        ...state,
        locale: action.payload,
      };
    default:
      return state;
  }
};
const { darkAlgorithm } = theme;
const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  useEffect(() => {
    // console.log(initialState)

    // if (initialState.locale ==='l'){

    // }

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      console.log('?????');

      const newTheme = e.matches ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        // document.body.style.backgroundColor = "black";
      } else {
        document.documentElement.classList.remove('dark');
        // document.body.style.backgroundColor = "white";
      }

      dispatch({ type: 'SET_THEME', payload: newTheme });
    };

    handleSystemThemeChange({ matches: initialState.theme === 'dark' });

    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);

    const handleSystemLocaleChange = () => {
      const newLocale = navigator.language.startsWith('zh') ? zhCN : enUS;
      console.log(newLocale);
      dispatch({ type: 'SET_LOCALE', payload: newLocale });
    };
    window.addEventListener('languagechange', handleSystemLocaleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('languagechange', handleSystemLocaleChange);
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      <ConfigProvider
        locale={state.locale}
        theme={{
          token: {
            colorPrimary: '#0071c2',
          },
          algorithm: state.theme === 'dark' ? [darkAlgorithm] : [],
        }}
      >
        {children}
      </ConfigProvider>
    </GlobalContext.Provider>
  );
};

export { GlobalContext, GlobalProvider };
