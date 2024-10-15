import { expect, test } from 'vitest'
import mockCoverageData from './mock-coverage-data.json'
import mockCoverageData1 from './mock-coverage-data1.json'
import mockCoverageDataMerged from './mock-coverage-data-merged.json'

import {mergeCoverageMap} from "../index.ts";
test('测试mergeCoverageMap方法', () => {
  expect(mergeCoverageMap(mockCoverageData,mockCoverageData1)).toMatchObject(mockCoverageDataMerged)
})
