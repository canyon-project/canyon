import { describe, it, expect } from 'vitest';
import { b1, b2, b3 } from '../src/b.js';

describe('B 模块 (0002)', () => {
  it('b1: *3', () => {
    expect(b1(4)).toBe(12);
  });
  it('b2: is even', () => {
    expect(b2(4)).toBe(true);
    expect(b2(5)).toBe(false);
  });
  it('b3: lower', () => {
    expect(b3('OK')).toBe('ok');
  });
});


