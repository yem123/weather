import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const unit = searchParams.get("unit") === "imperial" ? "imperial" : "metric";

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENWEATHER_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const url = new URL("https://api.openweathermap.org/data/2.5/weather");

    if (city) {
      url.searchParams.set("q", city);
    } else if (lat && lon) {
      url.searchParams.set("lat", lat);
      url.searchParams.set("lon", lon);
    } else {
      return NextResponse.json(
        { error: "City is required (or provide lat & lon)" },
        { status: 400 }
      );
    }

    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", unit);

    const res = await fetch(url.toString(), {
      
      next: { revalidate: 30 },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to fetch weather data" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}