import assert from 'node:assert/strict';
import test from 'node:test';
import { multiply } from './multiply.js';

test('multiplies 3 * 4 to equal 12', () => {
  assert.strictEqual(multiply(3, 4), 12);
});

test('multiplies 6 * 7 to equal 42', () => {
  assert.strictEqual(multiply(6, 7), 42);
});
