import { add } from './sum.js';

describe('Sum function', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('adds 5 + 7 to equal 12', () => {
    expect(add(5, 7)).toBe(12);
  });
});