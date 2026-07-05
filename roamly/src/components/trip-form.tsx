"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Minus, Plane, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CityAutocomplete,
  citySelectionFromName,
  type CitySelection,
} from "@/components/city-autocomplete";
import { cn } from "@/lib/utils";
import { STYLE_ACCENTS } from "@/lib/accent-colors";
import { IconToolbar } from "@/components/icon-toolbar";
import { ORDERED_INTEREST_ITEMS } from "@/lib/icon-themes";
import { todayString } from "@/lib/weather";
import {
  budgetRange,
  clampBudget,
  formatEuro,
  perPerson,
  TRAVELERS_MAX,
  TRAVELERS_MIN,
} from "@/lib/budget";
import { WeatherPreview } from "@/components/weather-preview";
import {
  TRAVEL_STYLES,
  type TripRequest,
} from "@/lib/schemas";

type TripFormProps = {
  onSubmit: (data: TripRequest) => void;
  onDestinationChange?: (destination: string) => void;
  isLoading?: boolean;
  currentCity?: string | null;
  prefillDestination?: string | null;
};

const STYLE_LABELS: Record<(typeof TRAVEL_STYLES)[number], string> = {
  backpacker: "Backpacker",
  "mid-range": "Mid-range",
  luxury: "Luxury",
};

const TRIP_DAYS_MIN = 1;
const TRIP_DAYS_MAX = 14;
const TRIP_DAYS_DEFAULT = 5;

export function TripForm({
  onSubmit,
  onDestinationChange,
  isLoading,
  currentCity,
  prefillDestination,
}: TripFormProps) {
  const [selectedCity, setSelectedCity] = useState<CitySelection | null>(null);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(() =>
    budgetRange(2, TRIP_DAYS_DEFAULT).defaultBudget
  );
  const [days, setDays] = useState(TRIP_DAYS_DEFAULT);
  const [style, setStyle] = useState<(typeof TRAVEL_STYLES)[number]>("mid-range");
  const [interests, setInterests] = useState<string[]>(["Cafés", "Nature"]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillDestination) {
      const city = citySelectionFromName(prefillDestination, "prefill");
      setSelectedCity(city);
      onDestinationChange?.(city.destination);
    }
  }, [prefillDestination, onDestinationChange]);

  const startDate = todayString();
  const tripDays = days;
  const { min: budgetMin, max: budgetMax, step: budgetStep } = useMemo(
    () => budgetRange(travelers, tripDays),
    [travelers, tripDays]
  );

  useEffect(() => {
    setBudget((current) => clampBudget(current, travelers, tripDays));
  }, [travelers, tripDays]);

  const budgetPerPerson = perPerson(budget, travelers);
  const budgetPerPersonDay = perPerson(budget, travelers * tripDays);

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  function handleCityChange(city: CitySelection | null) {
    setSelectedCity(city);
    onDestinationChange?.(city?.destination ?? "");
    if (city) setError("");
  }

  function useCurrentCity() {
    if (currentCity) {
      handleCityChange(citySelectionFromName(currentCity, "current"));
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!selectedCity) {
      setError("Select a city from the dropdown list.");
      return;
    }

    if (interests.length === 0) {
      setError("Select at least one interest.");
      return;
    }

    onSubmit({
      destination: selectedCity.destination,
      budget,
      travelers,
      days: tripDays,
      startDate,
      style,
      interests,
    });
  }

  return (
    <Card id="trip-form" className="overflow-visible border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
      <CardHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-stone-100">
          <Plane className="size-5 text-stone-600" />
        </div>
        <CardTitle className="text-xl text-stone-900">Plan your trip</CardTitle>
        <CardDescription className="text-sm text-stone-500">
          Tell us where you want to go and we&apos;ll build your itinerary in
          seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <CityAutocomplete
              id="destination"
              value={selectedCity}
              onChange={handleCityChange}
              disabled={isLoading}
            />
            <p className="text-xs text-stone-500">
              Pick a city from the suggestions — free text isn&apos;t allowed.
            </p>
            {currentCity ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={useCurrentCity}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-100 hover:text-stone-800"
                >
                  <MapPin className="size-3" />
                  Use {currentCity}
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="days" className="text-sm font-medium text-stone-800">
                Trip length
              </Label>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                {days} {days === 1 ? "day" : "days"}
              </p>
            </div>
            <Slider
              id="days"
              min={TRIP_DAYS_MIN}
              max={TRIP_DAYS_MAX}
              step={1}
              value={[days]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                if (next !== undefined) {
                  setDays(Math.min(TRIP_DAYS_MAX, Math.max(TRIP_DAYS_MIN, next)));
                }
              }}
              className="py-1 [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-track]]:rounded-full [&_[data-slot=slider-track]]:bg-stone-300 [&_[data-slot=slider-range]]:rounded-full [&_[data-slot=slider-range]]:bg-stone-800 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-stone-800 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-md"
            />
            <div className="flex justify-between text-sm font-medium tabular-nums text-stone-700">
              <span>1 day</span>
              <span>14 days</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelers">Travelers</Label>
            <div className="flex h-10 max-w-xs items-center justify-between rounded-md border border-stone-200 bg-stone-50 px-2">
              <button
                type="button"
                aria-label="Remove traveler"
                disabled={travelers <= TRAVELERS_MIN}
                onClick={() =>
                  setTravelers((current) =>
                    Math.max(TRAVELERS_MIN, current - 1)
                  )
                }
                className="inline-flex size-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-stone-900">
                <Users className="size-4 text-stone-500" />
                <span id="travelers">{travelers}</span>
                <span className="font-normal text-stone-500">
                  {travelers === 1 ? "person" : "people"}
                </span>
              </div>
              <button
                type="button"
                aria-label="Add traveler"
                disabled={travelers >= TRAVELERS_MAX}
                onClick={() =>
                  setTravelers((current) =>
                    Math.min(TRAVELERS_MAX, current + 1)
                  )
                }
                className="inline-flex size-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {selectedCity ? (
            <WeatherPreview
              destination={selectedCity.destination}
              startDate={startDate}
              days={days}
            />
          ) : null}

          <div className="space-y-2">
            <Label>Travel style</Label>
            <div className="grid grid-cols-3 gap-2">
              {TRAVEL_STYLES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStyle(option)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-xs font-medium transition-all",
                    style === option
                      ? STYLE_ACCENTS[option].active
                      : STYLE_ACCENTS[option].idle
                  )}
                >
                  {STYLE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <Label htmlFor="budget" className="text-sm font-medium text-stone-800">
                Group budget
              </Label>
              <div className="sm:text-right">
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                  {formatEuro(budget)}
                </p>
                <p className="text-sm font-medium text-stone-600">
                  {formatEuro(budgetPerPerson)} per person ·{" "}
                  {formatEuro(budgetPerPersonDay)}/day
                </p>
              </div>
            </div>
            <Slider
              id="budget"
              min={budgetMin}
              max={budgetMax}
              step={budgetStep}
              value={[budget]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                if (next !== undefined) {
                  setBudget(clampBudget(next, travelers, tripDays));
                }
              }}
              className="py-1 [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-track]]:rounded-full [&_[data-slot=slider-track]]:bg-stone-300 [&_[data-slot=slider-range]]:rounded-full [&_[data-slot=slider-range]]:bg-stone-800 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-stone-800 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-md"
            />
            <div className="flex justify-between text-sm font-medium tabular-nums text-stone-700">
              <span>{formatEuro(budgetMin)}</span>
              <span>{formatEuro(budgetMax)}</span>
            </div>
          </div>

          <div className="space-y-2 overflow-visible">
            <Label>Interests</Label>
            <IconToolbar
              items={ORDERED_INTEREST_ITEMS}
              selected={interests}
              onToggle={toggleInterest}
              showLabels
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full border border-stone-300 bg-stone-800 text-sm font-medium text-white hover:bg-stone-700"
            size="lg"
          >
            {isLoading ? "Generating..." : "Generate Itinerary"}
            {!isLoading ? <ArrowRight className="size-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
