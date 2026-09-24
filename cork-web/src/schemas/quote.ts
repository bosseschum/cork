import { z } from "zod";

export const quoteResponseSchema = z.object({
  quote: z.string(),
  author: z.string(),
});

export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
