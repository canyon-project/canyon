export function annotateList(coverage) {
  console.log(coverage, 'coverage');
  return coverage.line.map((item) => {
    return {
      ...item,
      startLine: item.nr,
      startCol: 1,
      endLine: item.nr,
      endCol: 1000,
    };
  });
}
