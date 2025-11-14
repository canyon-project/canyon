import { useMemo, useState } from 'react';

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

export default function TodoPage() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [text, setText] = useState('');

  const canAdd = useMemo(() => text.trim().length > 0, [text]);

  function handleAdd() {
    const value = text.trim();
    if (!value) return;
    const newItem: TodoItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: value,
      completed: false,
    };
    setItems((prev) => [newItem, ...prev]);
    setText('');
  }

  function handleToggle(id: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, completed: !it.completed } : it,
      ),
    );
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && canAdd) handleAdd();
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h1>Todo List</h1>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          data-testid="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          style={{ flex: 1, padding: 8 }}
        />
        <button
          data-testid="add-button"
          onClick={handleAdd}
          disabled={!canAdd}
          style={{ padding: '8px 12px' }}
        >
          Add
        </button>
      </div>

      <ul data-testid="todo-list" style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li
            key={item.id}
            data-testid="todo-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '8px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <input
                type="checkbox"
                aria-label="toggle"
                checked={item.completed}
                onChange={() => handleToggle(item.id)}
              />
              <span
                style={{
                  textDecoration: item.completed ? 'line-through' : 'none',
                  color: item.completed ? '#888' : 'inherit',
                }}
              >
                {item.text}
              </span>
            </label>
            <button
              aria-label="delete"
              onClick={() => handleDelete(item.id)}
              style={{ padding: '4px 10px' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


