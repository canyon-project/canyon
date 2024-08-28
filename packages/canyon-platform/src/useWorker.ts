import { loader } from "@monaco-editor/react";

loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs",
  },
});

// 打开下面的注释，注释掉上面的代码，即可纯粹的使用本地代码

// import * as monaco from "monaco-editor";
// loader.config({
//   monaco: monaco,
// });
