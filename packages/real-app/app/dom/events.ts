import type { TodoStore } from "../store/todo-store";
import type { TodoFilter } from "../types/todo";
const FILTER_VALUES: TodoFilter[] = ["all", "active", "completed"];

function isTodoFilter(value: string): value is TodoFilter {
  return (FILTER_VALUES as string[]).includes(value);
}

export function bindTodoEvents(root: HTMLElement, store: TodoStore): void {
  root.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.dataset.action !== "new-todo" || event.key !== "Enter") {
      return;
    }
    store.addTodo(target.value);
    target.value = "";
  });

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionEl = target.closest<HTMLElement>("[data-action]");
    if (!actionEl) {
      return;
    }

    const action = actionEl.dataset.action;
    const id = actionEl.dataset.id;

    switch (action) {
      case "toggle":
        if (id) {
          store.toggleTodo(id);
        }
        break;
      case "remove":
        if (id) {
          store.removeTodo(id);
        }
        break;
      case "filter": {
        const filter = actionEl.dataset.filter;
        if (filter && isTodoFilter(filter)) {
          store.setFilter(filter);
        }
        break;
      }
      case "clear-completed":
        store.clearCompleted();
        break;
      case "toggle-all": {
        const all = store.getAllTodos();
        const markCompleted = all.some((t) => !t.completed);
        store.toggleAll(markCompleted);
        break;
      }
      default:
        return;
    }
  });
}
