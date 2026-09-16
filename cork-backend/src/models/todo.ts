import { NotFoundError } from "../errors/NotFoundError.js";
import type { Todo } from "../schemas/todo.js";

export const exists = (todos: Todo[], id: string): boolean => {
  return todos.some((todo) => todo.id === id);
};

export const addTodo = (todos: Todo[], text: string): Todo[] => {
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date(),
  };
  return [...todos, newTodo];
};

export const toggleTodo = (todos: Todo[], id: string): Todo[] => {
  if (!exists(todos, id)) {
    throw new NotFoundError("Todo not found");
  }

  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
};

export const deleteTodo = (todos: Todo[], id: string): Todo[] => {
  if (!exists(todos, id)) {
    throw new NotFoundError("Todo not found");
  }

  return todos.filter((todo) => todo.id !== id);
};
