import assert from 'node:assert/strict';
import test from 'node:test';
import {add} from './sum.js';

test('adds 1 + 2 to equal 3', () => {
  assert.strictEqual(add(1, 2), 3);
});

test('adds 5 + 7 to equal 12', () => {
  assert.strictEqual(add(5, 7), 12);
});
