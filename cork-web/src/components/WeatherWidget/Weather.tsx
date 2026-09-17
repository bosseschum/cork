import React, { useState, useEffect } from "react";
import { z } from "zod";
import { WeatherResponseSchema } from "../../schemas/weather";
import type { WeatherResponse } from "../../schemas/weather";

function Weather() {
  const [userLocation, setUserLocation] = useState(null);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (position) {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        } else {
          throw new GeolocationPositionError();
        }
      });
    } else {
      throw new Error("Geolocation is not supported by this browser.");
    }
  };

  const getWeather = (location: string): Promise<WeatherResponse> => {};
}
