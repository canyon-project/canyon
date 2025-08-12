import { describe, it, expect } from 'vitest';
import { add, sum } from '../src/add.js';

describe('add & sum (0003)', () => {
  it('handles negative branch', () => {
    expect(add(-1, -2)).toBe(-3);
  });
  it('handles zero branch', () => {
    expect(add(0, 7)).toBe(7);
  });
  it('sum aggregated', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });
});


