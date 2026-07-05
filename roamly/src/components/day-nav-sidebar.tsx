"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { formatDate, WeatherBadge } from "@/components/weather-preview";
import { motionTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DayPlan, DayWeather } from "@/lib/schemas";

type DayNavSidebarProps = {
  days: DayPlan[];
  weatherByDay: Map<number, DayWeather>;
  activeDay: number;
  onDaySelect: (day: number) => void;
};

function DayNavButton({
  day,
  weather,
  isActive,
  isPast,
  onSelect,
  layout,
}: {
  day: DayPlan;
  weather?: DayWeather;
  isActive: boolean;
  isPast: boolean;
  onSelect: () => void;
  layout: "sidebar" | "rail";
}) {
  if (layout === "rail") {
    return (
      <motion.button
        type="button"
        onClick={onSelect}
        whileTap={{ scale: 0.96 }}
        transition={motionTransition.interactive}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-stone-800 text-white shadow-md"
            : "border border-stone-200 bg-white/90 text-stone-600 hover:border-stone-300 hover:bg-white hover:text-stone-900"
        )}
      >
        Day {day.day}
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={motionTransition.interactive}
      className={cn(
        "group relative w-full rounded-xl border px-3 py-3 text-left transition-all",
        isActive
          ? "border-stone-800 bg-stone-800 text-white shadow-md"
          : "border-stone-200/80 bg-white/80 text-stone-700 hover:border-stone-300 hover:bg-white hover:shadow-sm",
        isPast && !isActive && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-colors",
            isActive
              ? "bg-white/15 text-white"
              : "bg-stone-100 text-stone-800 group-hover:bg-stone-200"
          )}
        >
          {day.day}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium",
              isActive ? "text-stone-300" : "text-stone-500"
            )}
          >
            {weather ? formatDate(weather.date) : `Day ${day.day}`}
          </p>
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-sm font-medium leading-snug",
              isActive ? "text-white" : "text-stone-900"
            )}
          >
            {day.theme}
          </p>
          {weather ? (
            isActive ? (
              <p className="mt-1.5 text-xs text-stone-300">
                {weather.tempMax}° / {weather.tempMin}° · {weather.description}
              </p>
            ) : (
              <div className="mt-2 origin-left scale-90">
                <WeatherBadge weather={weather} compact />
              </div>
            )
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}

export function DayNavSidebar({
  days,
  weatherByDay,
  activeDay,
  onDaySelect,
}: DayNavSidebarProps) {
  const activeIndex = days.findIndex((day) => day.day === activeDay);

  return (
    <div className="min-w-0 lg:w-56 lg:shrink-0">
      {/* Mobile: sticky within day section only — scrolls away above overview */}
      <div className="sticky top-4 z-20 mb-4 lg:hidden">
        <div className="rounded-2xl border border-stone-200/80 bg-white/95 p-2 shadow-sm backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {days.map((day) => (
              <DayNavButton
                key={day.day}
                day={day}
                weather={weatherByDay.get(day.day)}
                isActive={day.day === activeDay}
                isPast={day.day < activeDay}
                onSelect={() => onDaySelect(day.day)}
                layout="rail"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: sticky in left column — bounded by day section, won't overlay overview */}
      <aside className="sticky top-6 hidden w-full self-start lg:block">
        <div className="max-h-[calc(100vh-3rem)] overflow-y-auto overscroll-contain rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-stone-100">
              <CalendarDays className="size-4 text-stone-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Jump to day</p>
              <p className="text-xs text-stone-500">{days.length} days</p>
            </div>
          </div>

          <nav className="relative space-y-2" aria-label="Day navigation">
            <div
              className="absolute top-5 bottom-5 left-5.5 w-px bg-stone-200"
              aria-hidden
            />

            {days.map((day, index) => (
              <div key={day.day} className="relative">
                <div
                  className={cn(
                    "absolute top-5 left-4.5 z-10 size-2.5 -translate-x-1/2 rounded-full border-2 transition-all duration-700",
                    day.day === activeDay
                      ? "scale-125 border-stone-800 bg-stone-800 ring-4 ring-stone-800/15"
                      : index < activeIndex
                        ? "border-stone-500 bg-stone-500"
                        : "border-stone-300 bg-white"
                  )}
                  aria-hidden
                />
                <div className="pl-7">
                  <DayNavButton
                    day={day}
                    weather={weatherByDay.get(day.day)}
                    isActive={day.day === activeDay}
                    isPast={day.day < activeDay}
                    onSelect={() => onDaySelect(day.day)}
                    layout="sidebar"
                  />
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
