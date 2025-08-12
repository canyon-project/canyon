import { describe, it, expect } from 'vitest';
import { add } from '../src/add.js';

describe('add (0001)', () => {
  it('adds two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});


