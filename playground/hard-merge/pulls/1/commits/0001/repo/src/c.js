export function c1(s) {
  return s.split('').reverse().join('');
}

export function c2(list) {
  return Array.from(new Set(list));
}

export function c3(obj) {
  return Object.keys(obj).length;
}
