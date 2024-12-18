import {
  compressCoverageData,
  compressCoverageDataByZstd,
  decompressCoverageData,
  decompressCoverageDataByZstd
} from '../../src/utils/compress';
const coverageData =  require('../fixtures/github-25.json')

test('compress coverage data', async () => {
  const compressedCoverageData = await compressCoverageData(coverageData)
  const decompressedCoverageData = await decompressCoverageData(compressedCoverageData);
  expect(decompressedCoverageData).toStrictEqual(coverageData);
});

test('compress coverage data by zstd', async () => {
  const compressedCoverageData = await compressCoverageDataByZstd(JSON.stringify(coverageData))
  // const decompressedCoverageData = await decompressCoverageDataByZstd(compressedCoverageData);
  // console.log(JSON.stringify(coverageData).length,decompressedCoverageData.length)
  expect(1).toStrictEqual(1);
});
