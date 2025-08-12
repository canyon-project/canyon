import { describe, it, expect } from 'vitest';
import { a1, a2, a3 } from '../src/a.js';

describe('A 模块 (0002)', () => {
  it('a1: +10', () => {
    expect(a1(1)).toBe(3);
  });
  it('a2: x - y', () => {
    expect(a2(5, 3)).toBe(2);
  });
  it('a3: sum array', () => {
    expect(a3([1, 2, 3])).toBe(6);
  });
});


