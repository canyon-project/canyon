/** 生成待办 id（演示用，非密码学安全） */
export function createTodoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
