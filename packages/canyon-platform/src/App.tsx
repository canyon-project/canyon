// import enUS from "antd/es/locale/en_US";
// import jaJP from "antd/es/locale/ja_JP";
// import zhCN from "antd/es/locale/zh_CN";
import { useRoutes } from "react-router-dom";

import routes from "~react-pages";

const App = () => {
  return (
    <div className={"dark:text-white dark:text-opacity-85"}>
      {useRoutes(routes)}
    </div>
  );
};

export default App;
