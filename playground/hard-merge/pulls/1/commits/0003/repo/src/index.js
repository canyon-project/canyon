import { a1, a2, a3 } from './a.js';
import { b1, b2, b3 } from './b.js';
import { c1, c2, c3 } from './c.js';

export function run() {
  return (
    a1(1) +
    a2(5, 2) +
    a3([1, 2, 3]) +
    (b2(4) ? b1(3) : 0) +
    b3('x').length +
    c1('ab').length +
    c2([1, 1, 2]).length +
    c3({ a: 1 })
  );
}
