import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import cn from "../locales/cn.json";
import en from "../locales/en.json";
import ja from "../locales/ja.json";
// import kor from "../locales/kor.json";
// import fra from "../locales/fra.json";
// import spa from "../locales/spa.json";
// import th from "../locales/th.json";
// // import ara from "../locales/ara.json";
// import ru from "../locales/ru.json";
// import pt from "../locales/pt.json";
// import de from "../locales/de.json";
// import it from "../locales/it.json";
// import el from "../locales/el.json";
// import nl from "../locales/nl.json";
// import pl from "../locales/pl.json";
// import bul from "../locales/bul.json";
// import est from "../locales/est.json";
// import dan from "../locales/dan.json";
// import fin from "../locales/fin.json";
// import cs from "../locales/cs.json";
// import rom from "../locales/rom.json";
// import slo from "../locales/slo.json";
// import swe from "../locales/swe.json";
// import hu from "../locales/hu.json";
// import cht from "../locales/cht.json";
// import vie from "../locales/vie.json";

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
  // kor: {
  //   translation: kor,
  // },
  // fra: {
  //   translation: fra,
  // },
  // spa: {
  //   translation: spa,
  // },
  // th: {
  //   translation: th,
  // },
  // // ara: {
  // //   translation: ara,
  // // },
  // ru: {
  //   translation: ru,
  // },
  // pt: {
  //   translation: pt,
  // },
  // de: {
  //   translation: de,
  // },
  // it: {
  //   translation: it,
  // },
  // el: {
  //   translation: el,
  // },
  // nl: {
  //   translation: nl,
  // },
  // pl: {
  //   translation: pl,
  // },
  // bul: {
  //   translation: bul,
  // },
  // est: {
  //   translation: est,
  // },
  // dan: {
  //   translation: dan,
  // },
  // fin: {
  //   translation: fin,
  // },
  // cs: {
  //   translation: cs,
  // },
  // rom: {
  //   translation: rom,
  // },
  // slo: {
  //   translation: slo,
  // },
  // swe: {
  //   translation: swe,
  // },
  // hu: {
  //   translation: hu,
  // },
  // cht: {
  //   translation: cht,
  // },
  // vie: {
  //   translation: vie,
  // },
};
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
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: resources,
    lng: localStorage.getItem("language") || "cn",
  });

export default i18n;
