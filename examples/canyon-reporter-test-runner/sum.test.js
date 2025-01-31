import assert from 'node:assert/strict';
import test from 'node:test';
import {sum} from './sum.js';
import {ride} from './ride.js';

test('adds 1 + 2 to equal 3', () => {
  assert.strictEqual(sum(1, 2), 3);
});

test('ride 1 + 2 to equal 2', () => {
  assert.strictEqual(ride(1, 2), 2);
});
