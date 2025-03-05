import { loader } from "@monaco-editor/react";

const UNPKG_URL = await fetch(`/api/base`)
  .then((r) => {
    return r.json();
  })
  .then((r) => r.UNPKG_URL || "https://unpkg.com");

console.log(UNPKG_URL, "UNPKG_URL");
loader.config({
  paths: { vs: `${UNPKG_URL}/monaco-editor@0.52.2/min/vs` },
});

loader.init().then((monaco) => {
  import("monaco-themes/themes/Night Owl.json").then((data: any) => {
    monaco.editor.defineTheme("nightOwl", data);
  });
});

// 如果要将Monaco打到本地，就用以下代码
// import { loader } from '@monaco-editor/react';
//
// import * as monaco from 'monaco-editor';
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
//
// self.MonacoEnvironment = {
//   getWorker(_, label) {
//     if (label === 'json') {
//       return new jsonWorker();
//     }
//     if (label === 'css' || label === 'scss' || label === 'less') {
//       return new cssWorker();
//     }
//     if (label === 'html' || label === 'handlebars' || label === 'razor') {
//       return new htmlWorker();
//     }
//     if (label === 'typescript' || label === 'javascript') {
//       return new tsWorker();
//     }
//     return new editorWorker();
//   },
// };
//
// loader.config({ monaco });
