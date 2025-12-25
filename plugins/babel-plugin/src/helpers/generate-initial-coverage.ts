import { extractCoverageData } from './extract-coverage-data';

export const generateInitialCoverage = (paramsPath, serviceParams) => {
  const initialCoverageDataForTheCurrentFile = extractCoverageData(paramsPath);
  return initialCoverageDataForTheCurrentFile;
};
