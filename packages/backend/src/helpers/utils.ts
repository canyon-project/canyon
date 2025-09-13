export function percent(covered: number, total: number) {
  let tmp: number;
  if (total > 0) {
    tmp = (1000 * 100 * covered) / total;
    return Math.floor(tmp / 10) / 100;
  }
  return 100.0;
}

// 将扁平化的分支命中键解码为 (branchId, armIndex)，并按 Istanbul 期望的数组形式聚合
const MAX_BRANCH_LENGTH = 10000;
function decodeBranchKey(encodedKey: string | number): [number, number] {
  const k = Number(encodedKey || 0);
  const branchId = Math.floor(k / MAX_BRANCH_LENGTH);
  const armIndex = k % MAX_BRANCH_LENGTH;
  return [branchId, armIndex];
}

export function transformFlatBranchHitsToArrays(
  flat: Record<string, number>,
  branchMapStructure?: Record<string, { locations?: unknown[] }>,
): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  if (flat) {
    for (const [k, v] of Object.entries(flat)) {
      const [id, idx] = decodeBranchKey(k);
      const key = String(id);
      if (!out[key]) out[key] = [];
      out[key][idx] = Number(v || 0);
    }
  }
  // 根据结构补齐零值长度
  if (branchMapStructure) {
    for (const [id, info] of Object.entries(branchMapStructure)) {
      const key = String(id);
      const pathsLen = Array.isArray(info.locations)
        ? info.locations.length
        : 0;
      if (!out[key]) out[key] = new Array<number>(pathsLen).fill(0);
      else if (pathsLen > out[key].length) {
        out[key].length = pathsLen;
        for (let i = 0; i < pathsLen; i++)
          if (out[key][i] === undefined) out[key][i] = 0;
      } else {
        // 将未赋值的空位补 0
        for (let i = 0; i < out[key].length; i++)
          if (out[key][i] === undefined) out[key][i] = 0;
      }
    }
  } else {
    // 没有结构时，也将未赋值的空位补 0，以避免稀疏数组
    for (const key of Object.keys(out)) {
      for (let i = 0; i < out[key].length; i++)
        if (out[key][i] === undefined) out[key][i] = 0;
    }
  }
  return out;
}
