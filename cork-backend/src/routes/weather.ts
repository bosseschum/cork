import { Router } from "express";
import { getWeather } from "../services/weatherService.js";
import { WeatherQuerySchema } from "../schemas/weather.js";
import z from "zod";

export const weatherRouter = Router();

weatherRouter.get("/", async (req, res) => {
  try {
    const partialQuery = WeatherQuerySchema.parse(req.query);
    const weather = await getWeather(partialQuery);
    res.json(weather);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});
