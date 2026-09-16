import express from "express";
import cors from "cors";
import { todosRouter } from "./routes/todos.js";

export const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/todos", todosRouter);
