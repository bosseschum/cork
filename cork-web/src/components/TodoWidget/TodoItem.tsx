import { useState, useRef, useEffect } from "react";
import type { Todo } from "../../schemas/todo";

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodoText?: (id: string, text: string) => void;
}

function TodoItem({
  todo,
  toggleTodo,
  deleteTodo,
  updateTodoText,
}: TodoItemProps): React.ReactNode {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editText.trim();

    if (!trimmed || trimmed === todo.text) {
      setIsEditing(false);
      return;
    }

    updateTodoText?.(todo.id, trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  return (
    <li className="list-group-item d-flex align-items-center justify-content-between py-3">
      <div className="d-flex align-items-center flex-grow-1 me-3">
        <input
          type="checkbox"
          className="form-check-input me-3 flex-shrink-0"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
        />

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="form-control form-control-sm"
            value={editText}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            onDoubleClick={handleStartEditing}
            title="Double-click to edit"
            className={`cursor-pointer user-select-none text-break ${
              todo.completed
                ? "text-decoration-line-through text-secondary"
                : ""
            }`}
          >
            {todo.text}
          </span>
        )}
      </div>

      <button
        className="btn btn-danger btn-sm flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteTodo(todo.id);
        }}
      >
        Delete
      </button>
    </li>
  );
}

export default TodoItem;
