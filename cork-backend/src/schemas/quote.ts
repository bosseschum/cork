import * as z from "zod";

export const QuoteSchema = z.object({
  q: z.string(),
  a: z.string(),
  h: z.string().optional(),
});

export const QuoteQuerySchema = z.object({
  category: z.string().optional(),
});

export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteQuery = z.infer<typeof QuoteQuerySchema>;
