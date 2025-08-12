import { describe, it, expect } from 'vitest';
import { b1, b2, b3 } from '../src/b.js';

describe('B 模块 (0001)', () => {
  it('b1: *2', () => {
    expect(b1(4)).toBe(8);
  });
  it('b2: is even', () => {
    expect(b2(4)).toBe(true);
    expect(b2(5)).toBe(false);
  });
  it('b3: upper', () => {
    expect(b3('ok')).toBe('OK');
  });
});


