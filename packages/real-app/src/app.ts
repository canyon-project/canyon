import { bindTodoEvents } from "./dom/events";
import { renderApp } from "./dom/render";
import { TodoStore } from "./store/todo-store";

/** 组装 Store + 视图 + 事件 */
export class TodoApp {
  private readonly root: HTMLElement;
  private readonly store: TodoStore;

  constructor(root: HTMLElement, store?: TodoStore) {
    this.root = root;
    this.store = store ?? new TodoStore();
  }

  start(): void {
    bindTodoEvents(this.root, this.store);
    this.store.subscribe(() => renderApp(this.root, this.store));
    renderApp(this.root, this.store);
  }
}
