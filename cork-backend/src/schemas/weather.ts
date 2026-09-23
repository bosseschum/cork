import { z } from "zod";

export const WeatherQuerySchema = z
  .object({
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
    location: z.string().optional(),
    q: z.string().optional(),
  })
  .transform((q) => ({
    lat: q.lat,
    lon: q.lon,
    location: q.location || q.q,
  }))
  .refine((q) => !!q.location || (q.lat !== undefined && q.lon !== undefined), {
    message: "Provide either a location or lat/lon coordinates",
  });

export type WeatherQuery = z.infer<typeof WeatherQuerySchema>;

export const WeatherRawResponseSchema = z.object({
  resolvedAddress: z.string(),
  currentConditions: z.object({
    temp: z.number(),
    conditions: z.string(),
    icon: z.string(),
  }),
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
