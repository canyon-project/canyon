"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const enums_1 = require("./enums");
function mountCounterApp() {
    const valueNode = document.querySelector('#value');
    const incButton = document.querySelector('#btn');
    if (!valueNode || !incButton)
        return;
    const valueEl = valueNode;
    const incButtonEl = incButton;
    function getCurrent() {
        const n = parseInt(valueEl.innerHTML || '0', 10);
        return Number.isNaN(n) ? 0 : n;
    }
    function setCurrent(n) {
        valueEl.innerHTML = String(n);
    }
    incButtonEl.addEventListener('click', () => {
        setCurrent(getCurrent() + 1);
    });
}
// Keep original logs from example
class Main {
    sayHello() {
        console.log('Hello World!');
        console.log(enums_1.TestEnum.A);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // no-op placeholder
});
function bootstrap() {
    new Main().sayHello();
    mountCounterApp();
}
bootstrap();
//# sourceMappingURL=main.js.map