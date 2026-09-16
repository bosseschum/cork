import * as z from "zod";

export const TodoSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  createdAt: z.date(),
});

export const CreateTodoSchema = z.object({
  text: z.string(),
});

export type Todo = z.infer<typeof TodoSchema>;
