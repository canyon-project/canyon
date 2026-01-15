import { createHash } from 'node:crypto';

/**
 * 计算字符串的 SHA1 hash
 *
 * @param content - 要计算 hash 的内容
 * @returns SHA1 hash 字符串
 */
export function computeHash(content: string): string {
  return createHash('sha1').update(content).digest('hex');
}
