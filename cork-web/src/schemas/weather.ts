import { z } from "zod";

export const WeatherResponseSchema = z.object({
  resolvedAddress: z.string(),
  days: z.array(
    z.object({
      datetime: z.string(),
      temp: z.number(),
      tempmin: z.number(),
      tempmax: z.number(),
      conditions: z.string(),
      icon: z.string(),
    }),
  ),
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
