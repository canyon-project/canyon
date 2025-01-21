import {genSummaryMapByCoverageMap} from 'canyon-data'
import {compressedData} from 'canyon-map'
export async function handleCoverage({coverage,instrumentCwd}) {

  const newCoverage = {}

  for (const coverageKey in coverage) {
    const newPath = coverage[coverageKey].path.replace(`${instrumentCwd}/`, "")
    newCoverage[newPath] = {
      ...coverage[coverageKey],
      path: newPath
    }
  }

  const summaryMap = genSummaryMapByCoverageMap(newCoverage);
  const summaryCompressed =await compressedData(summaryMap);
  const hitCompressed =await compressedData(newCoverage);
  return {summaryCompressed,hitCompressed}
}
