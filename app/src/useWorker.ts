import { loader } from "@monaco-editor/react";

const MONACO_CDN_VS = "https://unpkg.com/monaco-editor@0.55.1/min/vs";

declare global {
  interface Window {
    monaco?: unknown;
  }
}

self.MonacoEnvironment = {
  getWorkerUrl: () =>
    `data:text/javascript;charset=utf-8,${encodeURIComponent(
      `self.MonacoEnvironment={baseUrl:"${MONACO_CDN_VS}"};importScripts("${MONACO_CDN_VS}/base/worker/workerMain.js");`,
    )}`,
};

loader.config({
  paths: {
    vs: MONACO_CDN_VS,
  },
});

loader.init().then((monaco) => {
  if (typeof window !== "undefined") {
    window.monaco = monaco;
  }
});
