import {compressCoverageData, decompressCoverageData} from '../../src/utils/compress';
const coverageData =  require('../fixtures/github-25.json')

test('compress coverage data', async () => {
  const compressedCoverageData:any = await compressCoverageData(coverageData)
  const decompressedCoverageData = await decompressCoverageData(compressedCoverageData);
  expect(decompressedCoverageData).toStrictEqual(coverageData);
});
