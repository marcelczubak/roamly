export type DayWeather = {
  date: string;
  day: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  description: string;
  weatherCode: number;
};

export function weatherCodeToDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 75) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Mixed conditions";
}

function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export function todayString(): string {
  return localDateString(new Date());
}

export function maxStartDate(tripDays: number): string {
  return addDays(todayString(), 16 - tripDays);
}

export async function geocodeCity(
  city: string
): Promise<{ lat: number; lon: number; name: string } | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const result = data.results?.[0];

  if (!result) return null;

  return {
    lat: result.latitude,
    lon: result.longitude,
    name: result.name as string,
  };
}

export async function fetchTripWeather(
  destination: string,
  startDate: string,
  days: number
): Promise<DayWeather[] | null> {
  const location = await geocodeCity(destination);
  if (!location) return null;

  const endDate = addDays(startDate, days - 1);

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.lat));
  url.searchParams.set("longitude", String(location.lon));
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const daily = data.daily;

  if (!daily?.time?.length) return null;

  return daily.time.map((date: string, index: number) => {
    const weatherCode = daily.weather_code[index] as number;
    return {
      date,
      day: index + 1,
      tempMax: Math.round(daily.temperature_2m_max[index]),
      tempMin: Math.round(daily.temperature_2m_min[index]),
      precipitation: daily.precipitation_sum[index] as number,
      description: weatherCodeToDescription(weatherCode),
      weatherCode,
    };
  });
}

export function formatWeatherForPrompt(weather: DayWeather[]): string {
  return weather
    .map(
      (day) =>
        `Day ${day.day} (${day.date}): ${day.description}, ${day.tempMin}–${day.tempMax}°C, ${day.precipitation}mm precipitation`
    )
    .join("\n");
}
