import { expect, test } from 'vitest'
import {calculateNewLineCoverageForSingleFile} from "../line.ts";
import mock from './mock.json'
test('测试变更行覆盖率', () => {
  // @ts-ignore
  expect(calculateNewLineCoverageForSingleFile(mock,[1,2,77,78])).toMatchObject({ total: 4, covered: 2, skipped: 0, pct: 50 })
})
