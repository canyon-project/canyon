import { expect, test } from 'vitest'
import cov from './specs/mock-coverage.json';
import {
  calculateChangeBranchesCoverageForSingleFile
} from "../src/helpers/calculateChangeBranchesCoverageForSingleFile";


test('calculateChangeBranchesCoverageForSingleFile', () => {

  const d = calculateChangeBranchesCoverageForSingleFile(cov["src/domains/common/components/CenterSwiper/CenterSwiper.tsx"], [1, 2, 3, 4, 5, 6, 7, 8, 24,29])
  expect(d).toMatchObject({
    total: 1,
    covered: 1,
    pct: 100,
    skipped: 0
  })
})
