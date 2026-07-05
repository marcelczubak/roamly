"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  Euro,
  Lightbulb,
  MapPin,
  RefreshCw,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { ActivityImage } from "@/components/activity-image";
import { ActivityLeg } from "@/components/activity-leg";
import { DayNavSidebar } from "@/components/day-nav-sidebar";
import { CategoryBadge } from "@/components/icon-toolbar";
import { formatDate, WeatherBadge, WeatherStrip } from "@/components/weather-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatEuro, perPerson } from "@/lib/budget";
import { motionPage } from "@/lib/motion";
import { getCategoryIconItem } from "@/lib/icon-themes";
import { cn } from "@/lib/utils";
import type {
  Activity,
  DayPlan,
  DayWeather,
  GenerateResponse,
  MenuItem,
  TripRequest,
} from "@/lib/schemas";

type ItineraryResultsProps = {
  itinerary: GenerateResponse;
  trip: TripRequest;
  onBack: () => void;
};

const TIME_LABELS: Record<Activity["timeOfDay"], string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function formatPrice(amount: number, currency = "EUR") {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function GroupCost({
  amount,
  travelers,
  align = "right",
}: {
  amount: number;
  travelers: number;
  align?: "left" | "right";
}) {
  const perPersonAmount = perPerson(amount, travelers);

  return (
    <div className={cn("shrink-0", align === "right" && "text-right")}>
      <p className="text-sm font-semibold text-stone-700">
        {formatEuro(amount)}
        {travelers > 1 ? (
          <span className="ml-1 text-xs font-normal text-stone-500">group</span>
        ) : null}
      </p>
      {travelers > 1 ? (
        <p className="text-xs text-stone-500">
          {formatEuro(perPersonAmount)} pp
        </p>
      ) : null}
    </div>
  );
}

function MenuItemsList({ items }: { items: MenuItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50/60 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-orange-800">
        <UtensilsCrossed className="size-3.5" />
        Menu highlights
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={`${item.name}-${item.price}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-stone-900">{item.name}</span>
            <span className="shrink-0 font-medium text-orange-700">
              {formatPrice(item.price, item.currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityCard({
  activity,
  destination,
  travelers,
}: {
  activity: Activity;
  destination: string;
  travelers: number;
}) {
  const [showReasoning, setShowReasoning] = useState(false);
  const category = getCategoryIconItem(activity.category);
  const imageQuery =
    activity.imageQuery || activity.photoQuery || `${destination} ${activity.title}`;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex gap-4">
        <ActivityImage
          query={imageQuery}
          category={activity.category}
          title={activity.title}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={category} />
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Clock3 className="size-3" />
                  {TIME_LABELS[activity.timeOfDay]}
                </span>
              </div>
              <h4 className="font-medium text-stone-900">{activity.title}</h4>
              <p className="text-sm font-medium text-stone-700">
                {activity.venueName}
              </p>
              <p className="flex items-start gap-1 text-xs text-stone-500">
                <MapPin className="mt-0.5 size-3 shrink-0" />
                <span>
                  {activity.address} · {activity.neighborhood}
                </span>
              </p>
            </div>
            <GroupCost amount={activity.estimatedCost} travelers={travelers} />
          </div>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {activity.description}
          </p>

          {activity.menuItems && activity.menuItems.length > 0 ? (
            <MenuItemsList items={activity.menuItems} />
          ) : null}

          <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
            <span className="font-medium text-stone-900">Local tip: </span>
            {activity.localTip}
          </p>

          <button
            type="button"
            onClick={() => setShowReasoning((current) => !current)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900"
          >
            <Lightbulb className="size-3.5 text-stone-500" />
            Why this recommendation?
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-700",
                showReasoning && "rotate-180"
              )}
            />
          </button>

          {showReasoning ? (
            <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-600">
              {activity.reasoning}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DayCard({
  day,
  destination,
  weather,
  travelers,
  id,
}: {
  day: DayPlan;
  destination: string;
  weather?: DayWeather;
  travelers: number;
  id: string;
}) {
  return (
    <Card
      id={id}
      className="scroll-mt-20 overflow-hidden border-stone-200 bg-white shadow-sm"
    >
      <CardHeader className="border-b border-stone-100 bg-stone-50/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div>
              <CardTitle className="text-lg text-stone-900">
                Day {day.day}
                {weather ? (
                  <span className="ml-2 text-sm font-normal text-stone-500">
                    · {formatDate(weather.date)}
                  </span>
                ) : null}
              </CardTitle>
              <CardDescription className="text-sm text-stone-500">
                {day.theme}
              </CardDescription>
            </div>
            {weather ? <WeatherBadge weather={weather} compact /> : null}
          </div>
          <div>
            <p className="text-xs text-stone-500">Daily total</p>
            <GroupCost amount={day.dailyTotal} travelers={travelers} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {day.activities.map((activity, index) => (
          <Fragment key={`${day.day}-${index}`}>
            {index > 0 ? (
              <ActivityLeg
                from={day.activities[index - 1]}
                to={activity}
                tripDestination={destination}
              />
            ) : null}
            <ActivityCard
              activity={activity}
              destination={destination}
              travelers={travelers}
            />
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

export function ItineraryResults({
  itinerary,
  trip,
  onBack,
}: ItineraryResultsProps) {
  const { travelers } = trip;
  const [activeDay, setActiveDay] = useState(itinerary.days[0]?.day ?? 1);

  const weatherByDay = useMemo(() => {
    const map = new Map<number, DayWeather>();
    for (const entry of itinerary.weather ?? []) {
      map.set(entry.day, entry);
    }
    return map;
  }, [itinerary.weather]);

  const scrollToDay = useCallback((day: number) => {
    const element = document.getElementById(`itinerary-day-${day}`);
    if (!element) return;

    setActiveDay(day);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const dayElements = itinerary.days
      .map((day) => document.getElementById(`itinerary-day-${day.day}`))
      .filter((element): element is HTMLElement => element !== null);

    if (dayElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const id = visible[0]?.target.id;
        const dayNumber = Number(id?.replace("itinerary-day-", ""));
        if (!Number.isNaN(dayNumber)) {
          setActiveDay(dayNumber);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const element of dayElements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [itinerary.days]);

  const remainingBudget = trip.budget - itinerary.totalEstimatedCost;
  const remainingPerPerson = perPerson(remainingBudget, travelers);
  const breakdownItems = [
    { label: "Accommodation", value: itinerary.budgetBreakdown.accommodation },
    { label: "Food", value: itinerary.budgetBreakdown.food },
    { label: "Activities", value: itinerary.budgetBreakdown.activities },
    { label: "Transport", value: itinerary.budgetBreakdown.transport },
    { label: "Buffer", value: itinerary.budgetBreakdown.buffer },
  ];

  return (
    <motion.div
      initial={motionPage.initial}
      animate={motionPage.animate}
      exit={motionPage.exit}
      transition={motionPage.transition}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-9 border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
        >
          <ArrowLeft className="size-4" />
          Plan another trip
        </Button>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-stone-500" />
            {trip.destination} · {trip.days} days · {trip.startDate} · {trip.style}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-stone-500" />
            {travelers} {travelers === 1 ? "traveler" : "travelers"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-stone-900">
              Your trip overview
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-stone-600">
              {itinerary.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {itinerary.weather?.length ? (
              <WeatherStrip weather={itinerary.weather} />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs text-stone-500">Total estimated (group)</p>
                <p className="mt-1 text-2xl font-semibold text-stone-900">
                  {formatEuro(itinerary.totalEstimatedCost)}
                </p>
                {travelers > 1 ? (
                  <p className="mt-1 text-xs text-stone-500">
                    {formatEuro(perPerson(itinerary.totalEstimatedCost, travelers))} per person
                  </p>
                ) : null}
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs text-stone-500">Your group budget</p>
                <p className="mt-1 text-2xl font-semibold text-stone-900">
                  {formatEuro(trip.budget)}
                </p>
                {travelers > 1 ? (
                  <p className="mt-1 text-xs text-stone-500">
                    {formatEuro(perPerson(trip.budget, travelers))} per person
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  "rounded-xl border border-stone-200 p-4",
                  remainingBudget >= 0 ? "bg-stone-50" : "bg-red-50/50"
                )}
              >
                <p className="text-xs text-stone-500">Remaining</p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-semibold",
                    remainingBudget >= 0 ? "text-stone-900" : "text-red-700"
                  )}
                >
                  {formatEuro(remainingBudget)}
                </p>
                {travelers > 1 ? (
                  <p className="mt-1 text-xs text-stone-500">
                    {formatEuro(remainingPerPerson)} per person
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-stone-900">
              <Euro className="size-4 text-stone-500" />
              Budget breakdown
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              All amounts for your group of {travelers}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdownItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-stone-500">{item.label}</span>
                <GroupCost amount={item.value} travelers={travelers} />
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between gap-4 text-sm font-semibold">
              <span className="text-stone-700">Total</span>
              <GroupCost amount={itinerary.totalEstimatedCost} travelers={travelers} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div id="itinerary-day-plan" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-semibold text-stone-900">
            Day-by-day plan
          </h3>
          <p className="hidden text-sm text-stone-500 sm:block">
            {itinerary.days.length} days planned · costs shown for group
            {travelers > 1 ? ` of ${travelers}` : ""}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
          <DayNavSidebar
            days={itinerary.days}
            weatherByDay={weatherByDay}
            activeDay={activeDay}
            onDaySelect={scrollToDay}
          />

          <div className="grid min-w-0 gap-5">
            {itinerary.days.map((day) => (
              <DayCard
                key={day.day}
                id={`itinerary-day-${day.day}`}
                day={day}
                destination={trip.destination}
                weather={weatherByDay.get(day.day)}
                travelers={travelers}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50 px-6 py-5 text-center">
        <div>
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-stone-700">
            <RefreshCw className="size-4" />
            Regenerate a single day
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Coming soon — swap out any day without rebuilding the full trip.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
