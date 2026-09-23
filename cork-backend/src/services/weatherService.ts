import { WeatherRawResponseSchema } from "../schemas/weather.js";
import type { WeatherQuery, WeatherResponse } from "../schemas/weather.js";

async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "cork-web-app",
        },
      },
    );
    if (!res.ok) return `${lat},${lon}`;

    const data = await res.json();
    const addr = data.address;
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      data.display_name
    );
  } catch {
    return `${lat},${lon}`;
  }
}

export async function getWeather(
  query: WeatherQuery,
): Promise<WeatherResponse> {
  const apiKey = process.env.VISUAL_CROSSING_KEY;
  if (!apiKey) {
    throw new Error("Missing API key: VISUAL_CROSSING_KEY is not set");
  }

  const { lat, lon, location } = query;
  const searchTarget = location || `${lat},${lon}`;

  const response = await fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
      searchTarget,
    )}?unitGroup=metric&key=${apiKey}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();
  const parsed = WeatherRawResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Failed to parse weather data");
  }

  let resolvedLocation = parsed.data.resolvedAddress;
  if (!location && lat !== undefined && lon !== undefined) {
    resolvedLocation = await getLocationName(lat, lon);
  }

  const current = parsed.data.currentConditions;
  const forecast = parsed.data.days.slice(1, 6);

  return {
    location: resolvedLocation,
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
}
