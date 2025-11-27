// @ts-nocheck
import {TestEnum} from "./enums";
function mountCounterApp() {
  const valueNode = document.querySelector<HTMLSpanElement>('#value');
  const incButton = document.querySelector<HTMLButtonElement>('#btn');
  if (!valueNode || !incButton) return;

  const valueEl = valueNode as HTMLSpanElement;
  const incButtonEl = incButton as HTMLButtonElement;

  function getCurrent(): number {
    const n = parseInt(valueEl.innerHTML || '0', 10);
    return Number.isNaN(n) ? 0 : n;
  }

  function setCurrent(n: number) {
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
    console.log(TestEnum.A);
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
