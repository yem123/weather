
export type WeatherCondition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type WeatherMain = {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
};

export type WeatherWind = {
  speed: number;
  deg?: number;
};

export type WeatherSys = {
  country: string;
  sunrise: number;
  sunset: number;
};

export type WeatherCoord = {
  lon: number;
  lat: number;
};

export type WeatherClouds = {
  all: number;
};

export type WeatherResponse = {
  coord: WeatherCoord;
  weather: WeatherCondition[];
  main: WeatherMain;
  visibility: number;
  wind: WeatherWind;
  clouds: WeatherClouds;
  dt: number;
  sys: WeatherSys;
  timezone: number;
  name: string;
  cod: number;
};

export type Unit = "metric" | "imperial";

export type ForecastItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: { all: number };
  wind: { speed: number; deg: number };
  visibility?: number;
  dt_txt: string;
};

export type ForecastResponse = {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
};