/**
 * 安全地截取字符串的前6位
 * @param {string} str - 要截取的字符串
 * @param {string} [fallback=""] - 当输入为空时的回退值
 * @returns {string} - 截取后的字符串
 */
export function getFirstSix(str: string, fallback = '') {
  // 处理非字符串输入
  if (typeof str !== 'string') {
    return fallback;
  }

  // 处理空字符串
  if (str.length === 0) {
    return fallback;
  }

  // 截取前6位
  return str.substring(0, 8);
}
