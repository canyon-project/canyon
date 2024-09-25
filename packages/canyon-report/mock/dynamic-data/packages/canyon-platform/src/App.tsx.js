window["packages/canyon-platform/src/App.tsx"] = {
  content:
    'import enUS from "antd/es/locale/en_US";\nimport jaJP from "antd/es/locale/ja_JP";\nimport zhCN from "antd/es/locale/zh_CN";\nimport { useRoutes } from "react-router-dom";\n\nimport routes from "~react-pages";\n\nconst languages = {\n  cn: zhCN,\n  en: enUS,\n  ja: jaJP,\n};\n\nconst lng = (localStorage.getItem("language") ||\n  "cn") as keyof typeof languages;\n\nconst { darkAlgorithm } = theme;\nconst App = () => {\n  const isDark = localStorage.getItem("theme")\n    ? localStorage.getItem("theme") === "dark"\n    : false;\n  return (\n    <div className={"dark:text-white dark:text-opacity-85"}>\n      <ConfigProvider\n        locale={languages[lng]}\n        theme={{\n          token: {\n            colorPrimary: "#0071c2",\n          },\n          algorithm: isDark ? [darkAlgorithm] : [],\n        }}\n      >\n        {useRoutes(routes)}\n      </ConfigProvider>\n    </div>\n  );\n};\n\nexport default App;\n',
  coverage: { name: "zt" },
};


console.log('????')
