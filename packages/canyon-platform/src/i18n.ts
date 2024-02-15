import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// import languages from '../languages.json';
import cn from '../locales/cn.json';
import en from '../locales/en.json';
// import ja from '../locales/ja.json';
// import ko from '../locales/ko.json';
// import tw from '../locales/tw.json';
// const getIos = (code: string, languages: { code: string; iso: string }[]) =>
//   languages.find((item: { code: string }) => item.code === code)?.iso || 'en-US';
i18n
  // 检测用户当前使用的语言
  // 文档: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // 注入 react-i18next 实例
  .use(initReactI18next)
  // 初始化 i18next
  // 配置参数的文档: https://www.i18next.com/overview/configuration-options
  .init({
    // debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: en,
      },
      cn: {
        translation: cn,
      },
    },
    lng: localStorage.getItem('language') || 'cn',
  });

export default i18n;
