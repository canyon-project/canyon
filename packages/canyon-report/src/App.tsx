// @ts-nocheck
import { Report } from "./components";
import React, { useEffect, useState } from "react";

// 加载summary数据
// @ts-ignore
const dataSource = window.data;

// 重要
// 通过动态引入js文件的方式加载数据，避免全量覆盖率source文件的加载导致内存占用过大。加载完成后，删除全局变量
const dynamicLoadingSource = (val) => {
  return new Promise((resolve) => {
    // 1.检查是否是文件
    if (!val.includes(".")) {
      resolve({
        fileCoverage: undefined,
        fileContent: undefined,
      });
    } else {
      const script = document.createElement("script");
      script.src = `dynamic-data/${val}.js`;
      script.onload = () => {
        resolve({
          // @ts-ignore
          fileCoverage: window[val].coverage,
          // @ts-ignore
          fileContent: window[val].content,
        });
        document.body.removeChild(script);
        window[val] = undefined;
        console.log(window[val]);
      };
      document.body.appendChild(script);
    }
  });
};

function App() {
  const [value, setValue] = useState(window.location.hash.slice(1));
  const onSelect = (val) => {
    setValue(val);
    window.location.hash = val;
    return dynamicLoadingSource(val);
  };

  return (
    <div className={"m-5 shadow p-5"}>
      <Report dataSource={dataSource} onSelect={onSelect} value={value} />
    </div>
  );
}

export default App;
