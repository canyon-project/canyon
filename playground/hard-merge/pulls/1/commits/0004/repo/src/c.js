export function c1(s) {
  return [...s].reverse().join('');
}

export function c2(list) {
  return list.filter((v, i, arr) => arr.indexOf(v) === i);
}

export function c3(obj) {
  return Object.getOwnPropertyNames(obj).length;
}


