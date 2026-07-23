import { CanyonReportApp } from "../../src";

// 扩展 Window 接口
declare global {
  interface Window {
    reportData: {
      files: Array<{
        path: string;
        source: string;
        diff: {
          additions: number[];
          deletions: number[];
        };
      }>;
      instrumentCwd: string;
      generatedAt?: string;
    };
  }
}

function App() {
  const { files = [], instrumentCwd, generatedAt } = window.reportData;

  return (
    <CanyonReportApp
      files={files}
      instrumentCwd={instrumentCwd}
      generatedAt={generatedAt}
      defaultValue="packages/istanbul-lib-source-maps/lib/map-store.js"
    />
  );
}

export default App;
