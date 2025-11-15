// 可能是初始map，可能是包含sourceMap的数据
export function separateCoverage(coverage) {
  const separateCoverageHit = {};

  for (const coverageKey in coverage) {
    const { b, f, s } = coverage[coverageKey];
    separateCoverageHit[coverageKey] = {
      b,
      f,
      s,
      inputSourceMap: coverage[coverageKey].inputSourceMap ? 1 : 0,
      path: coverageKey,
    };
  }

  return {
    separateCoverageHit,
  };
}
