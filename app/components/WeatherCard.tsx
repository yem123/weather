
import type { WeatherResponse } from "@/types/weather";

type WeatherCardProps = {
  data: WeatherResponse;
  unit?: "metric" | "imperial";
};

function formatTemp(value: number, unit: "metric" | "imperial") {
  const suffix = unit === "metric" ? "°C" : "°F";
  return `${Math.round(value)}${suffix}`;
}

function formatVisibility(meters: number) {
  if (!Number.isFinite(meters)) return "—";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

function windDirection(deg?: number) {
  if (deg === undefined || deg === null || !Number.isFinite(deg)) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return `${dirs[index]} (${deg}°)`;
}

function formatTimeFromUnix(unixSeconds: number, timezoneOffsetSeconds: number) {
  const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  return date.toUTCString().slice(17, 22);
}

export default function WeatherCard({ data, unit = "metric" }: WeatherCardProps) {
  const condition = data.weather?.[0];

  const updatedLocal = new Date((data.dt + data.timezone) * 1000)
    .toUTCString()
    .replace("GMT", "");

  return (
    <section className="card">
      {/* Top Header */}
      <div
        className="row"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ minWidth: 240 }}>
          <div className="title" style={{ fontSize: 22 }}>
            {data.name}, {data.sys.country}
          </div>

          <div className="subtitle" style={{ marginTop: 4 }}>
            {condition?.main} • {condition?.description}
          </div>

          <div style={{ marginTop: 10 }} className="row">
            <span className="badge">🕒 Updated: {updatedLocal}</span>
            <span className="badge">
              📍 {data.coord.lat.toFixed(3)}, {data.coord.lon.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Icon + Main Temp */}
        <div style={{ textAlign: "right" }}>
          {condition?.icon ? (
            <img
              src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`}
              alt={condition.description}
              width={72}
              height={72}
              style={{ filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.35))" }}
            />
          ) : null}

          <div style={{ fontSize: 34, fontWeight: 800, marginTop: -8 }}>
            {formatTemp(data.main.temp, unit)}
          </div>

          <div className="subtitle">
            Feels like {formatTemp(data.main.feels_like, unit)}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row" style={{ marginTop: 16 }}>
        <div className="kpi">
          <div className="kpiLabel">Min / Max</div>
          <div className="kpiValue">
            {formatTemp(data.main.temp_min, unit)} / {formatTemp(data.main.temp_max, unit)}
          </div>
        </div>

        <div className="kpi">
          <div className="kpiLabel">Humidity</div>
          <div className="kpiValue">{data.main.humidity}%</div>
        </div>

        <div className="kpi">
          <div className="kpiLabel">Pressure</div>
          <div className="kpiValue">{data.main.pressure} hPa</div>
        </div>

        <div className="kpi">
          <div className="kpiLabel">Visibility</div>
          <div className="kpiValue">{formatVisibility(data.visibility)}</div>
        </div>

        <div className="kpi">
          <div className="kpiLabel">Cloudiness</div>
          <div className="kpiValue">{data.clouds.all}%</div>
        </div>

        <div className="kpi">
          <div className="kpiLabel">Wind</div>
          <div className="kpiValue">
            {Math.round(data.wind.speed)} m/s • {windDirection(data.wind.deg)}
          </div>
        </div>
      </div>

      {/* Extra Details */}
      <div className="row" style={{ marginTop: 14 }}>
        <span className="badge">
          🌅 Sunrise: {formatTimeFromUnix(data.sys.sunrise, data.timezone)}
        </span>
        <span className="badge">
          🌇 Sunset: {formatTimeFromUnix(data.sys.sunset, data.timezone)}
        </span>

        {typeof data.main.sea_level === "number" && (
          <span className="badge">🌊 Sea level: {data.main.sea_level} hPa</span>
        )}

        {typeof data.main.grnd_level === "number" && (
          <span className="badge">⛰ Ground level: {data.main.grnd_level} hPa</span>
        )}
      </div>
    </section>
  );
}