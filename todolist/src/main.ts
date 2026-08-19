import { loadTodos, saveTodos } from "./store";
import type { Filter, Todo } from "./types";

function mustQuery<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Missing ${selector}`);
  }
  return el;
}

const form = mustQuery<HTMLFormElement>("#todo-form");
const input = mustQuery<HTMLInputElement>("#todo-input");
const list = mustQuery<HTMLUListElement>("#todo-list");
const empty = mustQuery<HTMLParagraphElement>("#todo-empty");
const count = mustQuery<HTMLSpanElement>("#todo-count");
const filterButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");

let todos: Todo[] = loadTodos();
let filter: Filter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    return;
  }
  todos = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      done: false,
    },
    ...todos,
  ];
  input.value = "";
  persistAndRender();
});

list.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("toggle")) {
    return;
  }
  const id = target.closest("li")?.dataset.id;
  if (!id) {
    return;
  }
  todos = todos.map((todo) => (todo.id === id ? { ...todo, done: target.checked } : todo));
  persistAndRender();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("remove")) {
    return;
  }
  const id = target.closest("li")?.dataset.id;
  if (!id) {
    return;
  }
  todos = todos.filter((todo) => todo.id !== id);
  persistAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = button.dataset.filter;
    if (next !== "all" && next !== "active" && next !== "done") {
      return;
    }
    filter = next;
    render();
  });
});

function persistAndRender(): void {
  saveTodos(todos);
  render();
}

function visibleTodos(): Todo[] {
  if (filter === "active") {
    return todos.filter((todo) => !todo.done);
  }
  if (filter === "done") {
    return todos.filter((todo) => todo.done);
  }
  return todos;
}

function render(): void {
  const items = visibleTodos();
  const remaining = todos.filter((todo) => !todo.done).length;

  count.textContent = `${remaining} 项未完成`;
  empty.hidden = items.length > 0;
  list.innerHTML = items
    .map(
      (todo) => `
        <li class="${todo.done ? "done" : ""}" data-id="${todo.id}">
          <input class="toggle" type="checkbox" ${todo.done ? "checked" : ""} />
          <span class="text">${escapeHtml(todo.text)}</span>
          <button class="remove" type="button">删除</button>
        </li>
      `,
    )
    .join("");

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

render();
