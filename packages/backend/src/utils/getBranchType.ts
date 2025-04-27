const branchTypes = [
  { type: 'if', value: 1 },
  { type: 'binary-expr', value: 2 },
  { type: 'cond-expr', value: 3 },
  { type: 'switch', value: 4 },
  { type: 'default-arg', value: 5 },
];

// 根据分支类型返回对应的索引
export function getBranchTypeIndex(branch: string): number {
  for (let i = 0; i < branchTypes.length; i++) {
    if (branch === branchTypes[i].type) {
      return branchTypes[i].value;
    }
  }

  return 0; // 如果没有匹配，返回 0
}

// 根据索引返回对应的分支类型
export function getBranchTypeByIndex(index: number): string {
  for (let i = 0; i < branchTypes.length; i++) {
    if (index === branchTypes[i].value) {
      return branchTypes[i].type;
    }
  }

  return 'unknown'; // 如果没有匹配，返回 'unknown'
}
