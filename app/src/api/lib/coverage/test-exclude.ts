import TestExclude from "test-exclude";

export function testExclude(
  coverage: Record<string, unknown>,
  rule: string,
): Record<string, unknown> {
  let matchRule: {
    include?: string[];
    exclude?: string[];
    extensions?: string[];
  } = {};
  try {
    matchRule = JSON.parse(rule || "{}");
  } catch {
    // 解析失败时使用默认
  }
  const exclude = new TestExclude({
    cwd: "",
    include: matchRule.include,
    exclude: (matchRule.exclude || []).concat([
      "dist/**",
      "node_modules/**",
      ".cw/**",
      "index.ios.js",
    ]),
    extension: matchRule.extensions || [".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx", ".vue"],
  });

  const filterCoverage: Record<string, unknown> = {};
  for (const key of Object.keys(coverage)) {
    if (exclude.shouldInstrument(key)) {
      filterCoverage[key] = coverage[key];
    }
  }
  return Object.keys(filterCoverage).length > 0 ? filterCoverage : coverage;
}
