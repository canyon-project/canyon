import type { TodoStore } from "../store/todo-store";
import type { TodoFilter } from "../types/todo";

const FILTER_LABELS: Record<TodoFilter, string> = {
  all: "全部",
  active: "进行中",
  completed: "已完成",
};

export function renderApp(root: HTMLElement, store: TodoStore): void {
  const todos = store.getVisibleTodos();
  const activeCount = store.getActiveCount();
  const filter = store.getFilter();
  const allTodos = store.getAllTodos();
  const allCompleted = allTodos.length > 0 && allTodos.every((t) => t.completed);

  root.innerHTML = `
    <section class="todo-app" data-testid="todo-app">
      <header class="todo-header">
        <h1 class="todo-title">待办</h1>
        <input
          class="todo-new-input"
          data-action="new-todo"
          placeholder="今天要做什么？"
          aria-label="新待办"
        />
      </header>
      ${
        allTodos.length > 0
          ? `
      <section class="todo-main">
        <div class="todo-toggle-all">
          <input
            type="checkbox"
            id="toggle-all"
            data-action="toggle-all"
            ${allCompleted ? "checked" : ""}
          />
          <label for="toggle-all">全选</label>
        </div>
        <ul class="todo-list">
          ${todos
            .map(
              (todo) => `
            <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${escapeAttr(todo.id)}">
              <input
                type="checkbox"
                class="todo-toggle"
                data-action="toggle"
                data-id="${escapeAttr(todo.id)}"
                ${todo.completed ? "checked" : ""}
              />
              <label class="todo-label">${escapeHtml(todo.title)}</label>
              <button type="button" class="todo-destroy" data-action="remove" data-id="${escapeAttr(todo.id)}" aria-label="删除">×</button>
            </li>
          `,
            )
            .join("")}
        </ul>
      </section>
      <footer class="todo-footer">
        <span class="todo-count">${activeCount} 项未完成</span>
        <ul class="todo-filters">
          ${(Object.keys(FILTER_LABELS) as TodoFilter[])
            .map(
              (key) => `
            <li>
              <button
                type="button"
                class="todo-filter ${filter === key ? "selected" : ""}"
                data-action="filter"
                data-filter="${key}"
              >${FILTER_LABELS[key]}</button>
            </li>
          `,
            )
            .join("")}
        </ul>
        ${
          allTodos.some((t) => t.completed)
            ? `<button type="button" class="todo-clear-completed" data-action="clear-completed">清除已完成</button>`
            : ""
        }
      </footer>
      `
          : `<p class="todo-empty">暂无待办，在上方输入并回车添加。</p>`
      }
    </section>
  `;

  const input = root.querySelector<HTMLInputElement>('[data-action="new-todo"]');
  input?.focus();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, "&#39;");
}
