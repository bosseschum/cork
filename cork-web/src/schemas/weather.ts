import { z } from "zod";

export const WeatherResponseSchema = z.object({
  location: z.string(),
  currentTemp: z.number(),
  currentConditions: z.string(),
  forecast: z.array(
    z.object({
      datetime: z.string(),
      high: z.number(),
      low: z.number(),
      conditions: z.string(),
      icon: z.string(),
    }),
  ),
});

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
