(() => {
  const sendCoverage = () => {
    const dsn = (window as any).CANYON_DSN;
    const coverage = (window as any).__coverage__;
    if (dsn && coverage) {
      // 复制 coverage 对象并删除不需要的字段
      const cleanedCoverage: Record<string, any> = {};
      const fieldsToRemove = ['statementMap', 'fnMap', 'branchMap', 'inputSourceMap'];

      for (const [filePath, coverageData] of Object.entries(coverage)) {
        if (coverageData && typeof coverageData === 'object') {
          cleanedCoverage[filePath] = { ...coverageData };
          // 删除指定字段
          for (const field of fieldsToRemove) {
            delete cleanedCoverage[filePath][field];
          }
        }
      }

      fetch(dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverage: cleanedCoverage,
          scene: (window as any).CANYON_SCENE || {},
        }),
      });
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendCoverage();
    }
  });
})();
