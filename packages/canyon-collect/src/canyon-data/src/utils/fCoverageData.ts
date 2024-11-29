export const fCoverageData = (coverageData: any): any => {
  const obj: any = {};
  Object.entries(coverageData).forEach(([key, value]: any) => {
    obj[key] = {
      path: key,
      branchMap: {},
      statementMap: {},
      fnMap: {},
      ...value,
    };
  });
  return obj;
};
