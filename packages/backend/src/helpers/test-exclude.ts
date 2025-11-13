import TestExclude from 'test-exclude';
export function testExclude(coverage, rule) {
  let matchRule: {
    include?: string[];
    exclude?: string[];
    extensions?: string[];
  } = {}; // Default value
  try {
    // Attempt to parse project?.coverage
    matchRule = JSON.parse(rule || '{}');
  } catch (error) {
    console.log('Error parsing coverage:', error);
    // Log the error or handle it as needed
    // You can also return an empty object or any default value
  }
  const exclude = new TestExclude({
    cwd: '',
    include: matchRule.include,
    exclude: (matchRule.exclude || []).concat([
      'dist/**',
      'node_modules/**',
      '.cw/**',
      'index.ios.js',
    ]),
    extension: matchRule.extensions || [
      '.js',
      '.cjs',
      '.mjs',
      '.ts',
      '.tsx',
      '.jsx',
      '.vue',
    ],
  });

  const filterCoverage = {};

  for (const filterCoverageKey of Object.keys(coverage)) {
    // TODO 当过滤条件特别多的时候，性能会很差，大概能达到3s的计算时间，所以得在消费的时候就落库概览数据，summarys
    if (exclude.shouldInstrument(filterCoverageKey)) {
      filterCoverage[filterCoverageKey] = coverage[filterCoverageKey];
    }
  }
  return Object.keys(filterCoverage).length > 0 ? filterCoverage : coverage;
}
