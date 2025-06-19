import { expect, test } from 'vitest'
import cov from './specs/mock-coverage.json';
import {
  calculateChangeBranchesCoverageForSingleFile
} from "../src/helpers/calculateChangeBranchesCoverageForSingleFile";

test('calculateChangeBranchesCoverageForSingleFile', () => {

  const d = calculateChangeBranchesCoverageForSingleFile(cov, [14, 25, 55, 115])
  expect(d).toMatchObject({
    total: 5,
    covered: 4,
    pct: 80,
    skipped: 0
  })
})
