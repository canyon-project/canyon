const code = `function classifyNumber(value) {
  if (value === 0) return "zero";
  if (value > 0) return value % 2 === 0 ? "positive-even" : "positive-odd"; // 三元分支
  return Math.abs(value) % 2 === 0 ? "negative-even" : "negative-odd";
}

function isPrime(number) {
  if (number <= 1) return false; // 分支：<=1 直接返回
  if (number <= 3) return true;  // 分支：2 或 3
  if (number % 2 === 0 || number % 3 === 0) return false; // 短路分支
  for (let i = 5; i * i <= number; i += 6) {
    if (number % i === 0 || number % (i + 2) === 0) return false; // 分支
  }
  return true;
}

function calcShipping(weightKg, region) {
  const base = weightKg <= 1 ? 5 : weightKg <= 5 ? 10 : 20; // 嵌套三元作为分支
  switch (region) { // switch 分支
    case "domestic":
      return base;
    case "international":
      return base * 2 + 5;
    default:
      return base + 3; // 其他区域
  }
}

function summarize(values) {
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const n of values) {
    sum += n; // 语句
    if (n < min) min = n; // 分支
    if (n > max) max = n; // 分支
  }
  const avg = values.length ? sum / values.length : 0; // 分支
  return { sum, min, max, avg };
}

function main() {
  // 触发函数、分支与语句覆盖
  const c0 = classifyNumber(0);
  const c1 = classifyNumber(7);
  const c2 = classifyNumber(-4);

  const p0 = isPrime(1);   // false 分支（<=1）
  const p1 = isPrime(2);   // true 分支（<=3）
  const p2 = isPrime(9);   // false 分支（%3==0）
  const p3 = isPrime(29);  // true 分支（循环判断）

  const s1 = calcShipping(0.5, "domestic");
  const s2 = calcShipping(3, "international");
  const s3 = calcShipping(8, "other");

  const stats = summarize([3, 1, 4, 1, 5, 9]);

  // 控制台输出以便在 REPL/CI 中观察
  console.log("classify:", c0, c1, c2);
  console.log("prime:", p0, p1, p2, p3);
  console.log("shipping:", s1, s2, s3);
  console.log("stats:", stats);
}

main();`
export {code}
