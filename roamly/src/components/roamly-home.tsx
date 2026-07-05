"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, MapPin, Sparkles, Timer, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CityBackdrop } from "@/components/city-backdrop";
import { GenerationLoader } from "@/components/generation-loader";
import { ItineraryResults } from "@/components/itinerary-results";
import { TripForm } from "@/components/trip-form";
import { useCurrentCity } from "@/hooks/use-current-city";
import { FEATURE_ACCENTS } from "@/lib/accent-colors";
import type { GenerateResponse, TripRequest } from "@/lib/schemas";

type View = "form" | "loading" | "results";

const FEATURES = [
  {
    icon: Timer,
    title: "Seconds, not hours",
    description: "Skip the research rabbit hole and get a full plan instantly.",
  },
  {
    icon: Wallet,
    title: "Budget-aware",
    description: "Every recommendation fits your budget and travel style.",
  },
  {
    icon: Sparkles,
    title: "AI reasoning",
    description: "See why each restaurant and attraction was chosen for you.",
  },
];

export function RoamlyHome() {
  const [view, setView] = useState<View>("form");
  const [itinerary, setItinerary] = useState<GenerateResponse | null>(null);
  const [trip, setTrip] = useState<TripRequest | null>(null);
  const [error, setError] = useState("");
  const [prefillDestination, setPrefillDestination] = useState<string | null>(
    null
  );
  const [backdropCity, setBackdropCity] = useState<string | null>(null);
  const currentCity = useCurrentCity();

  useEffect(() => {
    if (
      currentCity.status === "ready" &&
      !backdropCity &&
      view === "form"
    ) {
      setBackdropCity(currentCity.city);
    }
  }, [currentCity, backdropCity, view]);

  function handleDestinationChange(destination: string) {
    const trimmed = destination.trim();
    if (trimmed) {
      setBackdropCity(trimmed);
    } else if (currentCity.status === "ready") {
      setBackdropCity(currentCity.city);
    } else {
      setBackdropCity(null);
    }
  }

  async function handleSubmit(data: TripRequest) {
    setError("");
    setView("loading");
    setTrip(data);
    setBackdropCity(data.destination);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to generate itinerary.");
      }

      setItinerary(result);
      setView("results");
    } catch (submitError) {
      setView("form");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong."
      );
    }
  }

  function handleBack() {
    setView("form");
    setItinerary(null);
    setTrip(null);
    setError("");
  }

  function planCurrentCity() {
    if (currentCity.status !== "ready") return;

    setPrefillDestination(currentCity.city);
    setBackdropCity(currentCity.city);
    document
      .getElementById("trip-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const displayBackdropCity =
    view === "results" && trip
      ? trip.destination
      : backdropCity;

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50">
      <CityBackdrop
        city={displayBackdropCity}
        variant={view === "form" ? "hero" : "content"}
      />

      <header className="relative z-10 border-b border-stone-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-stone-800 text-white shadow-sm">
              <Globe2 className="size-5" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold leading-none text-stone-900">
                Roamly
              </p>
              <p className="text-[11px] text-stone-500">AI travel planner</p>
            </div>
          </div>
          {currentCity.status === "ready" ? (
            <div className="hidden items-center gap-1.5 text-sm text-stone-500 sm:flex">
              <MapPin className="size-3.5" />
              {currentCity.city}
              {currentCity.country ? `, ${currentCity.country}` : ""}
            </div>
          ) : (
            <p className="hidden text-sm text-stone-500 sm:block">
              Personalized itineraries in seconds
            </p>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:py-16">
        <AnimatePresence mode="wait">
          {view === "results" && itinerary && trip ? (
            <ItineraryResults
              key="results"
              itinerary={itinerary}
              trip={trip}
              onBack={handleBack}
            />
          ) : view === "loading" ? (
            <GenerationLoader key="loading" />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]"
            >
              <section className="space-y-8 pt-4">
                <div className="space-y-4">
                  {currentCity.status === "loading" ? (
                    <div className="h-8 w-48 animate-pulse rounded-full bg-stone-200/80" />
                  ) : currentCity.status === "ready" ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                          <MapPin className="size-4 text-stone-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            You&apos;re in {currentCity.city}
                            {currentCity.country
                              ? `, ${currentCity.country}`
                              : ""}
                          </p>
                          <p className="text-xs text-stone-500">
                            Generate an itinerary for where you are now
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={planCurrentCity}
                        className="shrink-0 border-stone-300 bg-stone-800 text-white hover:bg-stone-700 hover:text-white"
                      >
                        Plan a trip here
                      </Button>
                    </div>
                  ) : null}

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-stone-500 backdrop-blur-sm">
                    <Sparkles className="size-3.5" />
                    AI-powered travel planning
                  </div>
                  <h1 className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl md:leading-[1.1]">
                    Your next adventure, planned in seconds
                  </h1>
                  <p className="max-w-lg text-base leading-relaxed text-stone-600 md:text-lg">
                    Roamly turns your destination, budget, and interests into a
                    beautiful day-by-day itinerary — with restaurants,
                    attractions, costs, and AI reasoning for every pick.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {FEATURES.map((feature, index) => (
                    <div
                      key={feature.title}
                      className={`rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm ${FEATURE_ACCENTS[index].card}`}
                    >
                      <div
                        className={`mb-3 flex size-8 items-center justify-center rounded-lg ${FEATURE_ACCENTS[index].icon}`}
                      >
                        <feature.icon className="size-4" />
                      </div>
                      <h3 className="text-sm font-medium text-stone-900">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-stone-500">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                {error ? (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 backdrop-blur-sm">
                    {error}
                  </div>
                ) : null}
                <TripForm
                  onSubmit={handleSubmit}
                  onDestinationChange={handleDestinationChange}
                  currentCity={
                    currentCity.status === "ready" ? currentCity.city : null
                  }
                  prefillDestination={prefillDestination}
                />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
