"use client";

import { useEffect, useRef, useState } from "react";
import ForecastPanel from "./components/ForecastPanel";
import type { ForecastResponse, Unit, WeatherResponse } from "@/types/weather";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";

type Status = "idle" | "loading" | "success" | "error";

type ApiErrorResponse = {
  error?: string;
};

const RECENT_KEY = "weather_recent_cities_v1";
const THEME_KEY = "weather_theme_v1";

function normalizeCity(city: string) {
  return city
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

export default function HomePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  const [unit, setUnit] = useState<Unit>("metric");
  const [recentCities, setRecentCities] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const abortRef = useRef<AbortController | null>(null);
 
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentCities(JSON.parse(saved) as string[]);
    } catch {}

    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  function saveRecentCity(city: string) {
    const normalized = normalizeCity(city);

    setRecentCities((prev) => {
      const next = [normalized, ...prev.filter((c) => c !== normalized)].slice(
        0,
        10
      );
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  async function fetchWeather(url: string, cityToSave?: string) {
    try {
      setStatus("loading");
      setError(null);
      setForecast(null);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch(url, { signal: abortRef.current.signal });
      const data = (await res.json()) as WeatherResponse | ApiErrorResponse;

      if (!res.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Failed to fetch weather data."
        );
      }

      const weatherData = data as WeatherResponse;

      setWeather(weatherData);
      setStatus("success");

      if (cityToSave) saveRecentCity(cityToSave);

      await fetchForecast(weatherData.coord.lat, weatherData.coord.lon);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      setWeather(null);
      setForecast(null);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function fetchForecast(lat: number, lon: number) {
    try {
      const res = await fetch(
        `/api/forecast?lat=${lat}&lon=${lon}&unit=${unit}`
      );

      const data = (await res.json()) as ForecastResponse | ApiErrorResponse;

      if (!res.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Failed to fetch forecast."
        );
      }

      setForecast(data as ForecastResponse);
    } catch (err) {
      console.error(err);
      setForecast(null);
    }
  }

  async function handleSearch(city: string) {
    const normalized = normalizeCity(city);
    await fetchWeather(
      `/api/weather?city=${encodeURIComponent(normalized)}&unit=${unit}`,
      normalized
    );
  }

  async function handlePickRecent(city: string) {
    await fetchWeather(
      `/api/weather?city=${encodeURIComponent(city)}&unit=${unit}`,
      city
    );
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported in your browser.");
      return;
    }

    setStatus("loading");
    setError(null);
    setForecast(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchWeather(
          `/api/weather?lat=${latitude}&lon=${longitude}&unit=${unit}`
        );
      },
      () => {
        setStatus("error");
        setError("Location permission denied. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
  
  if (weather) return;

  if (!navigator.geolocation) {
    
    fetchWeather(`/api/weather?city=Munich&unit=${unit}`, "Munich");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      await fetchWeather(
        `/api/weather?lat=${latitude}&lon=${longitude}&unit=${unit}`
      );
    },
    async () => {
      
      await fetchWeather(`/api/weather?city=Munich&unit=${unit}`, "Munich");
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
    }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <main className="container">
      <header className="header">
        <div>
          <div className="title">Weather App</div>
          <div className="subtitle">
            Current weather + hourly trend + 7-day forecast (charts)
          </div>
        </div>

        <div className="row">
          <button
            className="buttonSecondary"
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title="Toggle theme"
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      <SearchBar
        onSearch={handleSearch}
        onUseLocation={handleUseLocation}
        unit={unit}
        onUnitChange={setUnit}
        isLoading={status === "loading"}
        recentCities={recentCities}
        onPickRecent={handlePickRecent}
      />

      <div style={{ marginTop: 14 }}>
        {status === "idle" && (
          <div className="card">
            <div className="subtitle">
              Try searching: <b>London</b>, <b>Tokyo</b>, <b>Dubai</b>, <b>Toronto</b>
              <br />
              Or click <b>📍 Use location</b>.
            </div>
          </div>
        )}

        {status === "error" && error && <div className="error">❌ {error}</div>}

        {status === "loading" && (
          <div className="card skeleton" style={{ marginTop: 14 }}>
            <div className="subtitle">Fetching latest weather...</div>
            <div style={{ height: 12 }} />
            <div className="row">
              <div className="kpi" style={{ minHeight: 70 }} />
              <div className="kpi" style={{ minHeight: 70 }} />
              <div className="kpi" style={{ minHeight: 70 }} />
            </div>
          </div>
        )}

        {status === "success" && weather && (
          <div style={{ marginTop: 14 }}>
            <WeatherCard data={weather} unit={unit} />
          </div>
        )}

        {status === "success" && forecast && (
          <ForecastPanel data={forecast} unit={unit} />
        )}
      </div>
    </main>
  );
}