/** 单条待办 */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

/** 列表筛选，与 TodoMVC 一致 */
export type TodoFilter = "all" | "active" | "completed";
