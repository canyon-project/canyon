import { multiply } from './multiply.js';

describe('Multiply function', () => {
  test('multiplies 3 * 4 to equal 12', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  test('multiplies 6 * 7 to equal 42', () => {
    expect(multiply(6, 7)).toBe(42);
  });
});