export function percent(covered: number, total: number) {
  let tmp: number;
  if (total > 0) {
    tmp = (1000 * 100 * covered) / total;
    return Math.floor(tmp / 10) / 100;
  }
  return 100.0;
}
