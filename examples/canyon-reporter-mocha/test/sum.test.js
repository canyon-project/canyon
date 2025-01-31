const assert = require('assert');
const sum = require('../sum');
const ride = require('../ride');

describe('sum', function () {
  it('adds 1 + 2 to equal 3', function () {
    assert.strictEqual(sum(1, 2), 3);
  });
});
