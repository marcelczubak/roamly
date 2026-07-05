"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";
import type { DayWeather } from "@/lib/schemas";
import { cn } from "@/lib/utils";

function WeatherIcon({
  code,
  className,
}: {
  code: number;
  className?: string;
}) {
  if (code === 0) return <Sun className={className} />;
  if (code <= 3) return <CloudSun className={className} />;
  if (code <= 55) return <CloudDrizzle className={className} />;
  if (code <= 65) return <CloudRain className={className} />;
  if (code <= 75) return <CloudSnow className={className} />;
  return <Cloud className={className} />;
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-IE", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function DayWeatherHighlight({ weather }: { weather: DayWeather }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sky-100/80 bg-sky-50/30 px-4 py-3">
      <WeatherIcon code={weather.weatherCode} className="size-6 shrink-0 text-sky-600/90" />
      <div className="min-w-0">
        <p className="text-base font-semibold tabular-nums leading-none text-stone-800">
          {weather.tempMin}–{weather.tempMax}°C
        </p>
        <p className="mt-1 text-sm text-stone-600">
          {weather.description}
        </p>
      </div>
    </div>
  );
}

export function WeatherBadge({
  weather,
  compact = false,
}: {
  weather: DayWeather;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-stone-200 bg-white",
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      )}
    >
      <WeatherIcon code={weather.weatherCode} className="size-4 text-stone-600" />
      <div className="min-w-0">
        <p className={cn("font-medium text-stone-800", compact ? "text-xs" : "text-sm")}>
          {weather.tempMin}–{weather.tempMax}°C
        </p>
        {!compact ? (
          <p className="text-xs text-stone-500">{weather.description}</p>
        ) : null}
      </div>
    </div>
  );
}

type WeatherPreviewProps = {
  destination: string;
  startDate: string;
  days: number;
};

export function WeatherPreview({
  destination,
  startDate,
  days,
}: WeatherPreviewProps) {
  const [weather, setWeather] = useState<DayWeather[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!destination.trim() || !startDate) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          destination: destination.trim(),
          startDate,
          days: String(days),
        });

        const response = await fetch(`/api/weather?${params}`);
        const data = await response.json();

        if (!response.ok) {
          setWeather(null);
          setError(data.error ?? "Weather unavailable");
          return;
        }

        setWeather(data.weather);
      } catch {
        setWeather(null);
        setError("Weather unavailable");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, startDate, days]);

  if (!destination.trim() || !startDate) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="mb-2 text-xs font-medium text-stone-600">
        Forecast for {destination.trim()}
      </p>

      {loading ? (
        <div className="flex gap-2">
          {Array.from({ length: Math.min(days, 5) }).map((_, index) => (
            <div
              key={index}
              className="h-14 flex-1 animate-pulse rounded-lg bg-stone-200"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-stone-500">{error}</p>
      ) : weather ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weather.map((day) => (
            <div
              key={day.date}
              className="min-w-[88px] shrink-0 rounded-lg border border-stone-200 bg-white p-2 text-center"
            >
              <p className="text-[10px] text-stone-500">{formatDate(day.date)}</p>
              <div className="my-1 flex justify-center">
                <WeatherIcon
                  code={day.weatherCode}
                  className="size-4 text-stone-600"
                />
              </div>
              <p className="text-xs font-medium text-stone-800">
                {day.tempMin}–{day.tempMax}°
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WeatherStrip({ weather }: { weather: DayWeather[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {weather.map((day) => (
        <div
          key={day.date}
          className="min-w-[100px] shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
        >
          <p className="text-[10px] text-stone-500">Day {day.day}</p>
          <p className="text-xs text-stone-600">{formatDate(day.date)}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <WeatherIcon code={day.weatherCode} className="size-3.5 text-stone-600" />
            <span className="text-xs font-medium text-stone-800">
              {day.tempMin}–{day.tempMax}°C
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-stone-500">{day.description}</p>
        </div>
      ))}
    </div>
  );
}

export { WeatherIcon, formatDate };
