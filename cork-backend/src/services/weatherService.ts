import {
  WeatherRawResponseSchema,
  WeatherResponseSchema,
} from "../schemas/weather.js";
import type { WeatherQuery, WeatherResponse } from "../schemas/weather.js";

export async function getWeather(
  query: WeatherQuery,
): Promise<WeatherResponse> {
  const apiKey = process.env.VISUAL_CROSSING_KEY;
  if (!apiKey) {
    throw new Error("Missing API key: VISUAL_CROSSING_KEY is not set");
  }
  const { lat, lon, location } = query;
  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location || lat + "," + lon}?unitGroup=metric&key=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();
  const parsed = WeatherRawResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Failed to parse weather data");
  }

  const current = parsed.data.currentConditions;
  const forecast = parsed.data.days.slice(1, 6);

  const weather: WeatherResponse = {
    location: parsed.data.resolvedAddress,
    currentTemp: current.temp,
    currentConditions: current.conditions,
    forecast: forecast.map((day) => ({
      datetime: day.datetime,
      high: day.tempmax,
      low: day.tempmin,
      conditions: day.conditions,
      icon: day.icon,
    })),
  };

  return WeatherResponseSchema.parse(weather);
}