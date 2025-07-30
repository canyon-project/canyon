export default {
  index: {
    type: "page",
    display: "hidden",
    title: "はじめに",
    theme: {
      // sidebar: true,
      toc: false,
    },
  },
  documentation: {
    title: "ドキュメント",
    type: "page",
  },
  api: {
    title: "API",
    type: "page",
  },
  support: {
    title: "サポート",
    type: "page",
  },
  language: {
    title: "言語",
    type: "menu",
    items: {
      en: {
        title: "English",
        href: "https://docs.canyonjs.org",
      },
      cn: {
        title: "中文",
        href: "https://cn.docs.canyonjs.org",
      },
    },
  },
};
