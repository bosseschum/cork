import type { Todo } from "../../schemas/todo";

function TodoItem({
  todo,
  toggleTodo,
  deleteTodo,
}: {
  todo: Todo;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}): React.ReactNode {
  return (
    <li
      key={todo.id}
      role="button"
      className="list-group-item d-flex align-items-center justify-content-between py-3 cursor-pointer"
      onDoubleClick={() => toggleTodo(todo.id)}
    >
      <span
        className={
          todo.completed
            ? "text-decoration-line-through text-secondary user-select-none"
            : "text-break user-select-none"
        }
      >
        {todo.text}
      </span>
      <button
        className="btn btn-danger btn-sm ms-2"
        onClick={() => deleteTodo(todo.id)}
      >
        Delete
      </button>
    </li>
  );
}

export default TodoItem;
