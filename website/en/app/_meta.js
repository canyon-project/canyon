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
    title: "Language",
    type: "menu",
    items: {
      en: {
        title: "Simplified Chinese",
        href: "https://cn.docs.canyonjs.org",
      },
      ja: {
        title: "Japanese",
        href: "https://ja.docs.canyonjs.org",
      },
    },
  },
};
