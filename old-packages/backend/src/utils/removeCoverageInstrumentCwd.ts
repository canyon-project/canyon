export const removeCoverageInstrumentCwd = (
  coverage,
  instrumentCwd: string,
) => {
  return Object.values(coverage)
    .map((item: any) => {
      return {
        ...item,
        path: item.path.replace(instrumentCwd + '/', ''),
      };
    })
    .reduce((acc, cur) => {
      return {
        ...acc,
        [cur.path]: cur,
      };
    }, {});
};
