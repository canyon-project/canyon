import { describe, it, expect } from 'vitest';
import { add, inc, sum } from '../src/add.js';

describe('add & inc & sum (0002)', () => {
  it('handles a === 0 branch', () => {
    expect(add(0, 5)).toBe(5);
  });
  it('adds normally', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('inc increases by 1', () => {
    expect(inc(2)).toBe(3);
  });
  it('sum aggregated', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });
});


