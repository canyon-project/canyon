import { Report } from "./components";
import { useState } from "react";
// import coverageSummaryData from "./assets/coverage-summary.json";

function App() {
  // 当前激活的路径，默认值是哈希值
  const [activePath, setActivePath] = useState(window.location.hash.slice(1));

  const [coreValue, setCoreValue] = useState({});

  function onClickFile(path) {
    //   1. 通过js创建script标签加载变量
    const script = document.createElement("script");
    script.src = `/report/dynamic-data/${path}.js`;
    script.onload = () => {
      console.log("加载完成");
      setCoreValue(window[path]);
      //   移除script标签
      document.body.removeChild(script);
      window[path] = undefined;
    };
    document.body.appendChild(script);

    window.location.hash = path;
    setActivePath(path);
  }

  return (
    <div>
      <Report coverageSummaryData={{}} />

      {activePath}
      <a
        onClick={() => {
          onClickFile("packages/canyon-platform/src/App.tsx");
        }}
      >
        {/*点击*/}
      </a>
    </div>
  );
}

export default App;
