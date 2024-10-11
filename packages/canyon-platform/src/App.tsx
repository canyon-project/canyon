// import enUS from "antd/es/locale/en_US";
// import jaJP from "antd/es/locale/ja_JP";
// import zhCN from "antd/es/locale/zh_CN";
import { useRoutes } from "react-router-dom";

import routes from "~react-pages";
// routes
//   .find((route) => route.path === "/")
//   .children.push({
//     path: "*",
//     element: () => <div>404</div>,
//   });
console.log(routes);
const App = () => {
  return (
    <div className={"dark:text-white dark:text-opacity-85"}>
      {useRoutes(routes)}
    </div>
  );
};

export default App;
