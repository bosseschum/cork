import { useState, useEffect } from "react";
import { WeatherResponseSchema } from "../schemas/weather";
import type { WeatherResponse } from "../schemas/weather";

function Weather() {
  const isGeolocationSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  const [userLocation, setUserLocation] = useState<
    { latitude: number; longitude: number } | string | null
  >(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(isGeolocationSupported);
  const [error, setError] = useState<string | null>(
    isGeolocationSupported
      ? null
      : "Geolocation is not supported by this browser.",
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => {
        setError(`Failed to retrieve location: ${err.message}`);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const getWeather = async () => {
      let url = "http://localhost:3000/weather";

      if (typeof userLocation === "string") {
        url += `?location=${encodeURIComponent(userLocation)}`;
      } else {
        url += `?lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsed = WeatherResponseSchema.safeParse(data);

      if (!parsed.success) {
        console.error(parsed.error.issues);
        throw new Error("Invalid API response format");
      }

      return parsed.data;
    };

    const fetchAndSetWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const weatherData = await getWeather();
        setWeather(weatherData);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetWeather();
  }, [userLocation]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setUserLocation(searchInput.trim());
      setSearchInput("");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2 mb-0">Loading weather data...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="alert alert-danger shadow-sm m-4" role="alert">
          <h5 className="alert-heading fw-bold mb-1">{error}</h5>
        </div>
      )}

      {!weather ? (
        <div className="card shadow-sm border-0 bg-light text-center py-4 px-3">
          <p className="text-secondary mb-3">
            Location could not be automatically detected. Please enter a city
            manually.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="d-flex justify-content-center gap-2"
          >
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Enter city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </div>
      ) : (
        <div className="border-0 shadow-sm rounded-4 py-4 px-3 bg-light">
          <div className="card shadow-sm rounded-3 border-0">
            {/* Header with Title and Search Input */}
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="card-title mb-0 fw-semibold">
                Weather for {weather.location}
              </h5>
              <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Change city..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-outline-primary btn-sm"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="card-body bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small text-uppercase fw-semibold">
                    Current Conditions
                  </span>
                  <h6 className="mb-0 text-secondary">
                    {weather.currentConditions}
                  </h6>
                </div>
                <div className="display-6 fw-bold text-primary">
                  {weather.currentTemp} °C
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="px-3 py-2 bg-light border-bottom">
                <span className="text-muted small text-uppercase fw-semibold">
                  5-Day Forecast
                </span>
              </div>
              <ul className="list-group list-group-flush">
                {weather.forecast.map((day) => (
                  <li
                    key={day.datetime}
                    className="list-group-item d-flex align-items-center justify-content-between py-3"
                  >
                    <span className="fw-medium">{day.datetime}</span>
                    <span className="text-secondary">{day.conditions}</span>
                    <span className="badge bg-light text-dark border">
                      {day.low}°C — {day.high}°C
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-light text-muted small text-end mt-2 me-1">
            {weather.forecast.length} days forecasted
          </div>
        </div>
      )}
    </>
  );
}

export default Weather;
