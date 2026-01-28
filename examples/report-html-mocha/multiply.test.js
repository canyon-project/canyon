const { multiply } = require('./multiply.js');
const assert = require('node:assert');

describe('Multiply function', () => {
  it('multiplies 3 * 4 to equal 12', () => {
    assert.strictEqual(multiply(3, 4), 12);
  });

  it('multiplies 6 * 7 to equal 42', () => {
    assert.strictEqual(multiply(6, 7), 42);
  });
});
