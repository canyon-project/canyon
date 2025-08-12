import { describe, it, expect } from 'vitest';
import { c1, c2, c3 } from '../src/c.js';

describe('C 模块 (0001)', () => {
  it('c1: reverse', () => {
    expect(c1('abc')).toBe('cba');
  });
  it('c2: unique', () => {
    expect(c2([1, 1, 2, 3])).toEqual([1, 2, 3]);
  });
  it('c3: object keys length', () => {
    expect(c3({ a: 1, b: 2 })).toBe(2);
  });
});


