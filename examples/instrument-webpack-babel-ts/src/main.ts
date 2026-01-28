import { TestEnum } from './enums';

class Main {
  sayHello() {
    console.log('Hello World!');
    console.log(TestEnum.A);
  }
}

new Main().sayHello();
