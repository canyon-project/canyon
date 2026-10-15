import { loadTodos, saveTodos } from "../storage/todo-repository";
import type { Todo, TodoFilter } from "../types/todo";
import { createTodoId } from "../utils/create-id";

export type TodoStoreListener = () => void;

export class TodoStore {
  private todos: Todo[];
  private filter: TodoFilter = "all";
  private listeners = new Set<TodoStoreListener>();

  constructor(initialTodos?: Todo[]) {
    this.todos = initialTodos ?? loadTodos();
  }

  subscribe(listener: TodoStoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getFilter(): TodoFilter {
    return this.filter;
  }

  getAllTodos(): Todo[] {
    return [...this.todos];
  }

  getVisibleTodos(): Todo[] {
    switch (this.filter) {
      case "active":
        return this.todos.filter((t) => !t.completed);
      case "completed":
        return this.todos.filter((t) => t.completed);
      default:
        return this.getAllTodos();
    }
  }

  getActiveCount(): number {
    return this.todos.filter((t) => !t.completed).length;
  }

  setFilter(filter: TodoFilter): void {
    if (this.filter === filter) {
      return;
    }
    this.filter = filter;
    this.emit();
  }

  addTodo(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    this.todos = [
      {
        id: createTodoId(),
        title: trimmed,
        completed: false,
        createdAt: Date.now(),
      },
      ...this.todos,
    ];
    this.persistAndEmit();
  }

  toggleTodo(id: string): void {
    this.todos = this.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    this.persistAndEmit();
  }

  removeTodo(id: string): void {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.persistAndEmit();
  }

  clearCompleted(): void {
    this.todos = this.todos.filter((t) => !t.completed);
    this.persistAndEmit();
  }

  toggleAll(completed: boolean): void {
    this.todos = this.todos.map((t) => ({ ...t, completed }));
    this.persistAndEmit();
  }

  private persistAndEmit(): void {
    saveTodos(this.todos);
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
