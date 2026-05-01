
"use client";

import type { ForecastResponse, Unit } from "@/types/weather";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

type Props = {
  data: ForecastResponse;
  unit: Unit;
};

function formatTemp(t: number, unit: Unit) {
  return `${Math.round(t)}${unit === "metric" ? "°C" : "°F"}`;
}

function formatHour(dt_txt: string) {
  
  const time = dt_txt.split(" ")[1]?.slice(0, 5);
  return time || dt_txt;
}

export default function ForecastPanel({ data, unit }: Props) {
  if (!data?.list?.length) {
    return (
      <section className="card" style={{ marginTop: 14 }}>
        <div className="title" style={{ fontSize: 18 }}>
          📉 Forecast
        </div>
        <div className="subtitle" style={{ marginTop: 6 }}>
          No forecast data available.
        </div>
      </section>
    );
  }

  const nextHours = data.list.slice(0, 8);

  const chartData = nextHours.map((item) => ({
    time: formatHour(item.dt_txt),
    temp: Math.round(item.main.temp),
    feels: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    wind: item.wind?.speed ?? 0,
  }));

  const tempUnit = unit === "metric" ? "°C" : "°F";

  return (
    <section className="card" style={{ marginTop: 14 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="title" style={{ fontSize: 18 }}>
            📊 Next 24 Hours Forecast
          </div>
          <div className="subtitle" style={{ marginTop: 4 }}>
            {data.city.name}, {data.city.country} • 3-hour steps (Free Plan)
          </div>
        </div>
      </div>

      {/* Temperature Line Chart */}
      <div style={{ marginTop: 16 }}>
        <div className="subtitle" style={{ marginBottom: 8 }}>
          🌡 Temperature ({tempUnit})
        </div>

        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name) => {
                  if (name === "temp") return [`${value}${tempUnit}`, "Temp"];
                  if (name === "feels") return [`${value}${tempUnit}`, "Feels Like"];
                  return [value, name];
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="feels"
                strokeWidth={2}
                dot={false}
                opacity={0.6}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Humidity Area Chart */}
      <div style={{ marginTop: 20 }}>
        <div className="subtitle" style={{ marginBottom: 8 }}>
          💧 Humidity (%)
        </div>

        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "Humidity"]}
              />
              <Area type="monotone" dataKey="humidity" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards Row (still useful) */}
      <div
        className="row"
        style={{
          marginTop: 18,
          overflowX: "auto",
          paddingBottom: 6,
        }}
      >
        {nextHours.map((item) => {
          const condition = item.weather?.[0];
          return (
            <div
              key={item.dt}
              className="kpi"
              style={{
                minWidth: 160,
                textAlign: "center",
              }}
            >
              <div className="kpiLabel">{formatHour(item.dt_txt)}</div>

              {condition?.icon ? (
                <img
                  src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`}
                  alt={condition.description}
                  width={50}
                  height={50}
                  style={{ margin: "6px auto" }}
                />
              ) : null}

              <div className="kpiValue">{formatTemp(item.main.temp, unit)}</div>

              <div className="subtitle" style={{ marginTop: 4, fontSize: 12 }}>
                {condition?.main}
              </div>

              <div className="subtitle" style={{ marginTop: 6, fontSize: 12 }}>
                💧 {item.main.humidity}% • 🌬 {Math.round(item.wind.speed)} m/s
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}