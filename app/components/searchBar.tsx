"use client";

import { useMemo, useState } from "react";
import type { Unit } from "@/types/weather";

type SearchBarProps = {
  onSearch: (city: string) => void;
  onUseLocation: () => void;
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  isLoading?: boolean;
  recentCities: string[];
  onPickRecent: (city: string) => void;
};

export default function SearchBar({
  onSearch,
  onUseLocation,
  unit,
  onUnitChange,
  isLoading = false,
  recentCities,
  onPickRecent,
}: SearchBarProps) {
  const [city, setCity] = useState<string>("");

  const trimmed = useMemo(() => city.trim(), [city]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="searchWrap">
          <input
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search by city (e.g. London, Dubai, Karachi)"
            aria-label="Search city"
          />

          <button className="button" disabled={isLoading} type="submit">
            {isLoading ? "Searching..." : "Search"}
          </button>

          <button
            className="buttonSecondary"
            type="button"
            onClick={onUseLocation}
            disabled={isLoading}
            title="Use my current location"
          >
            📍 Use location
          </button>

          <button
            className="buttonSecondary"
            type="button"
            onClick={() => onUnitChange(unit === "metric" ? "imperial" : "metric")}
            disabled={isLoading}
            title="Toggle °C / °F"
          >
            {unit === "metric" ? "°C" : "°F"}
          </button>
        </div>
      </form>

      {recentCities.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="subtitle" style={{ marginBottom: 8 }}>
            Recent searches
          </div>

          <div className="row">
            {recentCities.slice(0, 6).map((c) => (
              <button
                key={c}
                className="buttonSecondary"
                style={{ height: 36, padding: "0 12px" }}
                type="button"
                onClick={() => {
                  setCity(c);
                  onPickRecent(c);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}