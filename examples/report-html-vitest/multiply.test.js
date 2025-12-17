import { describe, expect, it } from 'vitest';
import { multiply } from './multiply.js';

describe('Multiply function', () => {
  it('multiplies 3 * 4 to equal 12', () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it('multiplies 6 * 7 to equal 42', () => {
    expect(multiply(6, 7)).toBe(42);
  });
});
