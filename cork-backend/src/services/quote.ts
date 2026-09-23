import { QuoteSchema } from "../schemas/quote.js";
import type { Quote } from "../schemas/quote.js";
import z from "zod";

const API_URL = "https://zenquotes.io/api/today/";

export async function getQuote(): Promise<Quote> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const parsed = z.array(QuoteSchema).safeParse(data);

  if (!parsed.success || parsed.data.length === 0) {
    throw new Error("Invalid quote data received from API");
  }

  const quote = parsed.data[0];

  if (!quote) {
    throw new Error("No quote found in API response");
  }

  return quote;
}
