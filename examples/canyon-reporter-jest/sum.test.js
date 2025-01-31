const sum = require('./sum');
const ride = require('./ride');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
