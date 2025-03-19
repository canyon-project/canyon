export default {
  index: {
    type: "page",
    display: "hidden",
    title: "Introduction",
    theme: {
      // sidebar: true,
      toc: false,
    },
  },
  documentation: {
    title: "ドキュメント",
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
      ja: {
        title: "日本語",
        href: "https://cn.docs.canyonjs.org",
      },
    },
  },
};
