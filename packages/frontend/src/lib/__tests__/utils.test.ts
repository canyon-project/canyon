import { describe, expect, it } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('应该合并多个类名', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('应该处理单个类名', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('应该处理空输入', () => {
    expect(cn()).toBe('');
  });

  it('应该过滤掉 falsy 值', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('应该处理条件类名对象', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
  });

  it('应该处理数组输入', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('应该合并冲突的 Tailwind 类名（后者覆盖前者）', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('应该合并冲突的 Tailwind 颜色类', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('应该保留不冲突的 Tailwind 类', () => {
    expect(cn('px-2', 'py-4', 'text-red-500')).toBe('px-2 py-4 text-red-500');
  });

  it('应该处理复杂的混合输入', () => {
    const result = cn(
      'base-class',
      { 'conditional-class': true, 'hidden-class': false },
      ['array-class'],
      undefined,
      'px-2',
      'px-4', // 应覆盖 px-2
    );
    expect(result).toBe('base-class conditional-class array-class px-4');
  });
});
