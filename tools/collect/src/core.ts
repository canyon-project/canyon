import { getGlobal } from "./global.js";

export const sendCoverage = () => {
  const g = getGlobal();
  const dsn = g.CANYON_DSN;
  const coverage = g.__coverage__;
  if (dsn && coverage) {
    const groupedCoverage: Record<string, Record<string, unknown>> = {};
    const fieldsToRemove = ["statementMap", "fnMap", "branchMap", "inputSourceMap"];

    for (const [filePath, coverageData] of Object.entries(coverage)) {
      if (coverageData && typeof coverageData === "object") {
        const buildHash = (coverageData as { buildHash?: string }).buildHash;
        if (!buildHash) {
          continue;
        }

        const cleanedData = { ...(coverageData as Record<string, unknown>) };
        for (const field of fieldsToRemove) {
          delete cleanedData[field];
        }

        if (!groupedCoverage[buildHash]) {
          groupedCoverage[buildHash] = {};
        }
        groupedCoverage[buildHash][filePath] = cleanedData;
      }
    }

    const scene = g.CANYON_SCENE || {};

    for (const [buildHash, coverageByBuildHash] of Object.entries(groupedCoverage)) {
      void fetch(dsn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify({
          buildHash,
          coverage: coverageByBuildHash,
          scene,
        }),
      });
    }
  }
};

let listenerAttached = false;

export const installCollect = () => {
  if (listenerAttached) {
    return;
  }
  listenerAttached = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendCoverage();
    }
  });
};
