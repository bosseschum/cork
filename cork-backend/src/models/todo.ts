import { NotFoundError } from "../errors/NotFoundError.js";
import type { Todo, UpdateTodoInput } from "../schemas/todo.js";

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

export const deleteTodo = (todos: Todo[], id: string): Todo[] => {
  if (!exists(todos, id)) {
    throw new NotFoundError("Todo not found");
  }

  return todos.filter((todo) => todo.id !== id);
};

export const updateTodo = (
  todos: Todo[],
  id: string,
  updates: UpdateTodoInput,
): Todo[] => {
  let found = false;

  const nextTodos = todos.map((todo): Todo => {
    if (todo.id !== id) return todo;
    found = true;

    return {
      ...todo,
      ...(updates.text !== undefined && { text: updates.text }),
      ...(updates.completed !== undefined && { completed: updates.completed }),
    };
  });

  if (!found) {
    throw new NotFoundError("Todo not found");
  }

  return nextTodos;
};
