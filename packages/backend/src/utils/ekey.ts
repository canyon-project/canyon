const MAX_BRANCH_LENGTH = 10000; // 每个分支的最大长度

// 编码：生成唯一的键
export function encodeKey(branchId, branchLength) {
  return branchId * MAX_BRANCH_LENGTH + branchLength;
}

// 解码：将唯一的键解码为 branchId 和 branchLength
export function decodeKey(encodedKey) {
  const branchId = Math.floor(encodedKey / MAX_BRANCH_LENGTH); // 使用 branchId 替代 branchIndex
  const branchLength = encodedKey % MAX_BRANCH_LENGTH;
  return [branchId, branchLength];
}

/**
 * 扁平化分支结构
 * @param b 分支原始对象，如 { "0": [0, 1], "1": [1, 0] }
 * @returns 扁平结构，如 { 0: 0, 1: 1, 100000: 1, 100001: 0 }
 */
export function flattenBranchMap(
  b: Record<string, number[]>,
): Record<number, number> {
  const result: Record<number, number> = {};

  Object.entries(b).forEach(([branchIdStr, hitArray]) => {
    const branchId = Number(branchIdStr);
    hitArray.forEach((hitCount, index) => {
      const encodedKey = encodeKey(branchId, index);
      result[encodedKey] = hitCount;
    });
  });

  return result;
}
