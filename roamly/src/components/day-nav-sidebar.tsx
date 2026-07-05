"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { formatDate, WeatherIcon } from "@/components/weather-preview";
import { motionTransition } from "@/lib/motion";
import {
  getCategoryIconItem,
  ICON_THEMES,
  INTEREST_ICON_MAP,
  type ThemedIconItem,
} from "@/lib/icon-themes";
import { cn } from "@/lib/utils";
import type { Activity, DayPlan, DayWeather } from "@/lib/schemas";

type DayNavSidebarProps = {
  days: DayPlan[];
  weatherByDay: Map<number, DayWeather>;
  activeDay: number;
  onDaySelect: (day: number) => void;
};

const THEME_KEYWORDS: Array<[string, ThemedIconItem]> = [
  ["café", INTEREST_ICON_MAP["Cafés"]],
  ["cafe", INTEREST_ICON_MAP["Cafés"]],
  ["coffee", INTEREST_ICON_MAP["Cafés"]],
  ["food", INTEREST_ICON_MAP.Food],
  ["culinary", INTEREST_ICON_MAP.Food],
  ["dining", INTEREST_ICON_MAP.Food],
  ["restaurant", INTEREST_ICON_MAP.Food],
  ["nature", INTEREST_ICON_MAP.Nature],
  ["park", INTEREST_ICON_MAP.Nature],
  ["outdoor", INTEREST_ICON_MAP.Nature],
  ["museum", INTEREST_ICON_MAP.Museums],
  ["gallery", INTEREST_ICON_MAP.Museums],
  ["culture", INTEREST_ICON_MAP.Museums],
  ["nightlife", INTEREST_ICON_MAP.Nightlife],
  ["bar", INTEREST_ICON_MAP.Nightlife],
  ["shopping", INTEREST_ICON_MAP.Shopping],
  ["market", INTEREST_ICON_MAP.Shopping],
  ["history", INTEREST_ICON_MAP.History],
  ["historic", INTEREST_ICON_MAP.History],
  ["heritage", INTEREST_ICON_MAP.History],
  ["art", INTEREST_ICON_MAP.Art],
  ["adventure", INTEREST_ICON_MAP.Adventure],
  ["hike", INTEREST_ICON_MAP.Adventure],
];

function matchThemeToInterestIcon(theme: string): ThemedIconItem {
  const themeLower = theme.toLowerCase();

  for (const [keyword, item] of THEME_KEYWORDS) {
    if (themeLower.includes(keyword)) {
      return item;
    }
  }

  return getCategoryIconItem("attraction");
}

function getDayIconItems(day: DayPlan): ThemedIconItem[] {
  const categoryCounts = new Map<Activity["category"], number>();

  for (const activity of day.activities) {
    if (activity.category === "transport") {
      continue;
    }

    categoryCounts.set(
      activity.category,
      (categoryCounts.get(activity.category) ?? 0) + 1
    );
  }

  if (categoryCounts.size > 0) {
    return [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => getCategoryIconItem(category));
  }

  return [matchThemeToInterestIcon(day.theme)];
}

function DayInterestIcons({
  items,
  isActive,
  compact = false,
}: {
  items: ThemedIconItem[];
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-1")}>
      {items.map((item) => {
        const Icon = item.icon;
        const theme = ICON_THEMES[item.theme];

        return (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-center rounded-md border",
              compact ? "size-6" : "size-7",
              isActive
                ? "border-white/20 bg-white/10"
                : cn(theme.bg, theme.border)
            )}
          >
            <Icon
              className={cn(
                compact ? "size-3" : "size-3.5",
                isActive ? "text-white" : theme.icon
              )}
              strokeWidth={2}
            />
          </div>
        );
      })}
    </div>
  );
}

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
  const dayIcons = getDayIconItems(day);

  if (layout === "rail") {
    return (
      <motion.button
        type="button"
        onClick={onSelect}
        whileTap={{ scale: 0.96 }}
        transition={motionTransition.interactive}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-stone-800 text-white shadow-md"
            : "border border-stone-200 bg-white/90 text-stone-600 hover:border-stone-300 hover:bg-white hover:text-stone-900"
        )}
      >
        {isActive && weather ? (
          <>
            <WeatherIcon code={weather.weatherCode} className="size-3.5 shrink-0" />
            <span>
              Day {day.day} · {weather.tempMax}°
            </span>
          </>
        ) : (
          <>
            <DayInterestIcons items={dayIcons} isActive={false} compact />
            <span>Day {day.day}</span>
          </>
        )}
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
          {isActive && weather ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-300">
              <WeatherIcon code={weather.weatherCode} className="size-3.5 shrink-0" />
              <span>
                {weather.tempMax}° / {weather.tempMin}° · {weather.description}
              </span>
            </div>
          ) : !isActive ? (
            <div className="mt-2">
              <DayInterestIcons items={dayIcons} isActive={false} />
            </div>
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
