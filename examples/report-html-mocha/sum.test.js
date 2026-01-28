const { add } = require('./sum.js');
const assert = require('node:assert');

describe('Sum function', () => {
  it('adds 1 + 2 to equal 3', () => {
    assert.strictEqual(add(1, 2), 3);
  });

  it('adds 5 + 7 to equal 12', () => {
    assert.strictEqual(add(5, 7), 12);
  });
});
