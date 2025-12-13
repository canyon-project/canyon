export const getColor = (pct: number) => {
  if (pct >= 80) {
    return 'rgb(33,181,119)';
  }
  if (pct >= 50) {
    return 'rgb(244,176,27)';
  }
  return 'rgb(245,32,32)';
};
