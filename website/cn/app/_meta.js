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
    title: "文档",
    type: "page",
  },
  api: {
    title: "API",
    type: "page",
  },
  support: {
    title: "支持",
    type: "page",
  },
  language: {
    title: "语言",
    type: "menu",
    items: {
      en: {
        title: "English",
        href: "https://docs.canyonjs.org",
      },
      ja: {
        title: "日文",
        href: "https://ja.docs.canyonjs.org",
      },
    },
  },
};
