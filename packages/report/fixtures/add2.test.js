import { expect, test } from '@rstest/core';
import { sum2 } from './add2.js';

test('addss 1 + 2 to equal 3', () => {
  expect(sum2(1, 2)).toBe(3);
});
