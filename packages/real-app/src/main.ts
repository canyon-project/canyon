import { TodoApp } from "./app";

const root = document.getElementById("app");
if (!root) {
  throw new Error("缺少 #app 挂载节点");
}

new TodoApp(root).start();
