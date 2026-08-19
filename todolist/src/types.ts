export type Filter = "all" | "active" | "done";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};
