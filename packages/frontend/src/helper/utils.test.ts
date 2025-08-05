import { expect, test } from 'vitest';
import { percent } from './utils.ts';

test('adds 1 + 2 to equal 3', () => {
  expect(percent(1, 2)).toBe(50);
});
