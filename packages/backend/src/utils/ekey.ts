const MAX_BRANCH_LENGTH = 10000; // 每个分支的最大长度

// 解码：将唯一的键解码为 branchId 和 branchLength
export function decodeKey(encodedKey) {
  const branchId = Math.floor(encodedKey / MAX_BRANCH_LENGTH); // 使用 branchId 替代 branchIndex
  const branchLength = encodedKey % MAX_BRANCH_LENGTH;
  return [branchId, branchLength];
}
