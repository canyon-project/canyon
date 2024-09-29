export const getColor = (pct: number) => {
  if (pct >= 80) {
    return "rgb(33,181,119)";
  } else if (pct >= 50) {
    return "rgb(244,176,27)";
  } else {
    return "rgb(245,32,32)";
  }
};
