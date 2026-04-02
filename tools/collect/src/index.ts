(() => {
  const sendCoverage = () => {
    const dsn = (window as any).CANYON_DSN;
    const coverage = (window as any).__coverage__;
    if (dsn && coverage) {
      // 只保留有 buildHash 的覆盖率数据，并在组内删除不需要字段
      const groupedCoverage: Record<string, Record<string, any>> = {};
      const fieldsToRemove = ["statementMap", "fnMap", "branchMap", "inputSourceMap"];

      for (const [filePath, coverageData] of Object.entries(coverage)) {
        if (coverageData && typeof coverageData === "object") {
          const buildHash = (coverageData as any).buildHash;
          if (!buildHash) {
            continue;
          }

          const cleanedData = { ...(coverageData as any) };
          for (const field of fieldsToRemove) {
            delete cleanedData[field];
          }

          if (!groupedCoverage[buildHash]) {
            groupedCoverage[buildHash] = {};
          }
          groupedCoverage[buildHash][filePath] = cleanedData;
        }
      }

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
            scene: (window as any).CANYON_SCENE || {},
          }),
        });
      }
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendCoverage();
    }
  });
})();
