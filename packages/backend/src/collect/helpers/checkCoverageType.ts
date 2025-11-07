export const checkCoverageType = (coverage: {
  [key: string]: { statementMap: object };
}) => {
  if (Object.values(coverage)[0].statementMap) {
    return 'map';
  } else {
    return 'hit';
  }
};
