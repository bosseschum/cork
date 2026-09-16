import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { z } from "zod";
import { TodoSchema } from "../../schemas/todo";
import type { Todo } from "../../schemas/todo";
import TodoItem from "./TodoItem";
import AddTodoDialog from "./AddTodoDialog";

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoText, setTodoText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const API_URL = "http://localhost:3000/todos";

  // Fetch todos from the API
  const getTodos = async (): Promise<Todo[]> => {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const parsed = z.array(TodoSchema).safeParse(data);

    if (parsed.success) {
      return parsed.data;
    } else {
      console.error(parsed.error);
      throw parsed.error;
    }
  };

  useEffect(() => {
    const fetchAndSetTodos = async () => {
      try {
        const data = await getTodos();
        setTodos(data);
        setError(null);
      } catch (error) {
        console.error("Network or CORS error:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetTodos();
  }, []);

  // Input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodoText(e.target.value);
  };

  // Form submission: add a new Todo
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!todoText.trim()) return;

    const newTodo = { text: todoText };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });

      if (!response.ok) throw new Error("Failed to add todo");

      const data = await response.json();
      const parsed = z.array(TodoSchema).safeParse(data);

      if (!parsed.success) {
        console.error("API response does not match Todo schema:", parsed.error);
        return;
      }

      setTodos(parsed.data);
      setIsDialogOpen(false);
      setError(null);
      setTodoText("");
    } catch (error) {
      console.error("Error adding todo:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  useLayoutEffect(() => {
    if (isDialogOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isDialogOpen]);

  // Delete Todo from the list
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete Todo");

      const data = await response.json();
      const parsed = z.array(TodoSchema).safeParse(data);

      if (!parsed.success) {
        console.error("API response does not match Todo schema:", parsed.error);
        return;
      }

      setTodos(parsed.data);
      setError(null);
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const toggleTodo = async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !target.completed }),
      });

      if (!response.ok) throw new Error("Failed to toggle Todo");

      const data = await response.json();
      const parsed = z.array(TodoSchema).safeParse(data);

      if (!parsed.success) {
        console.error("API response does not match Todo schema:", parsed.error);
        return;
      }

      setTodos(parsed.data);
      setError(null);
    } catch (error) {
      console.error("Error toggling todo:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const updateTodoText = async (id: string, newText: string) => {
    // 1. Immediately update UI state
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t)),
    );

    // 2. Persist to API
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      const data = await response.json();
      const parsed = z.array(TodoSchema).safeParse(data);

      // If backend returns the full array, update with verified data
      if (parsed.success) {
        setTodos(parsed.data);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  // Loading State: Bootstrap centered spinner
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2 mb-0">Loading your tasks...</p>
      </div>
    );
  }

  // Empty State: Subtle callout box
  if (todos.length === 0) {
    return (
      <>
        {error && (
          <div className="alert alert-danger shadow-sm m-4" role="alert">
            <h5 className="alert-heading fw-bold mb-1">{error}</h5>
          </div>
        )}
        <div className="card shadow-sm border-0 bg-light text-center py-4 px-3">
          <p className="text-secondary mb-0">
            There is nothing to do. Have a great day! 🎉
          </p>
          <AddTodoDialog
            handleSubmit={handleSubmit}
            todoText={todoText}
            handleInputChange={handleInputChange}
            dialogRef={dialogRef}
            setIsDialogOpen={setIsDialogOpen}
          />
        </div>
      </>
    );
  }

  // Todo List: Styled list-group inside a clean card
  return (
    <>
      {error && (
        <div className="alert alert-danger shadow-sm m-4" role="alert">
          <h5 className="alert-heading fw-bold mb-1">{error}</h5>
        </div>
      )}
      <div className="border-0 shadow-sm rounded-4 py-4 px-3 bg-light">
        <div className="card shadow-sm rounded-3 border-0">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="card-title mb-0 fw-semibold">My Tasks</h5>
          </div>
          <ul className="list-group list-group-flush">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                deleteTodo={deleteTodo}
                toggleTodo={toggleTodo}
                updateTodoText={updateTodoText}
              />
            ))}
          </ul>
        </div>
        <AddTodoDialog
          dialogRef={dialogRef}
          handleSubmit={handleSubmit}
          todoText={todoText}
          handleInputChange={handleInputChange}
          setIsDialogOpen={setIsDialogOpen}
        />
        <div className="bg-light text-muted small text-end">
          {todos.length} {todos.length === 1 ? "task" : "tasks"} total
        </div>
      </div>
    </>
  );
}

export default TodoList;
