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
    title: "Documentation",
    type: "page",
  },
  support: {
    title: "Support",
    type: "page",
  },
  language: {
    title: "语言",
    type: "menu",
    items: {
      en: {
        title: "简体中文",
        href: "https://cn.docs.canyonjs.org",
      },
      ja: {
        title: "日文",
        href: "https://ja.docs.canyonjs.org",
      },
    },
  },
};
