export function add(a, b) {
  if (a < 0 && b < 0) {
    // 新增分支
    return -(Math.abs(a) + Math.abs(b));
  }
  if (a === 0) return b;
  return a + b;
}

export function inc(x) {
  return x + 1;
}

export function sum(arr) {
  return arr.reduce((acc, cur) => add(acc, cur), 0);
}


