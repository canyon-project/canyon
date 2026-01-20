import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import cn from '../locales/cn.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

const resources = {
  cn: {
    translation: cn,
  },
  en: {
    translation: en,
  },
  ja: {
    translation: ja,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: resources,
    lng: localStorage.getItem('language') || 'en',
  });

export default i18n;
