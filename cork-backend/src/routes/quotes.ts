import { Router } from "express";
import { getQuote } from "../services/quote.js";

export const quotesRouter = Router();

quotesRouter.get("/", async (_req, res) => {
  try {
    const quote = await getQuote();
    res.json(quote);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
});
