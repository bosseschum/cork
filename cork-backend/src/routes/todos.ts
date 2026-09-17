import { Router } from "express";
import z from "zod";

import type { Todo } from "../schemas/todo.js";
import { addTodo, deleteTodo, updateTodo } from "../models/todo.js";
import { CreateTodoSchema, PartialUpdateTodoSchema } from "../schemas/todo.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export const todosRouter = Router();

export let todos: Todo[] = [];

todosRouter.get("/", (req, res) => {
  res.json(todos);
});

todosRouter.post("/", (req, res) => {
  try {
    const { text } = CreateTodoSchema.parse(req.body);
    const updatedTodos = addTodo(todos, text);
    todos = updatedTodos;
    res.status(201).json(updatedTodos);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

todosRouter.patch("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = PartialUpdateTodoSchema.parse(req.body);
    const updatedTodos = updateTodo(todos, id, updates);
    todos = updatedTodos;
    res.json(updatedTodos);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

todosRouter.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updatedTodos = deleteTodo(todos, id);
    todos = updatedTodos;
    res.json(updatedTodos);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
