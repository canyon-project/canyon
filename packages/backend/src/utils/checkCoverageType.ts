export const checkCoverageType = (coverage) => {
  // @ts-ignore
  if (Object.values(coverage)[0].statementMap) {
    return 'map';
  } else {
    return 'hit';
  }
};
