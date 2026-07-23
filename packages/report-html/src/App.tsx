import "@canyonjs/report-component/index.css";
import { CanyonReportApp } from "@canyonjs/report-component";

import reportPkg from "../../report/package.json";

function App() {
  const { files = [], instrumentCwd, generatedAt } = window.reportData;

  return (
    <CanyonReportApp
      files={files}
      instrumentCwd={instrumentCwd}
      generatedAt={generatedAt}
      packageName={reportPkg.name}
      packageVersion={reportPkg.version}
    />
  );
}

export default App;