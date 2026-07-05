"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Sparkles, Timer, Wallet } from "lucide-react";
import { GenerationLoader } from "@/components/generation-loader";
import { ItineraryResults } from "@/components/itinerary-results";
import { TripForm } from "@/components/trip-form";
import type { Itinerary, TripRequest } from "@/lib/schemas";

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
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [trip, setTrip] = useState<TripRequest | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(data: TripRequest) {
    setError("");
    setView("loading");
    setTrip(data);

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.92_0.06_220)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute -right-24 top-32 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-sky-200/40 blur-3xl" />

      <header className="relative z-10 border-b border-white/50 bg-white/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Globe2 className="size-5" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold leading-none">
                Roamly
              </p>
              <p className="text-[11px] text-muted-foreground">
                AI travel planner
              </p>
            </div>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Personalized itineraries in seconds
          </p>
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
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="size-3.5" />
                    AI-powered travel planning
                  </div>
                  <h1 className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
                    Your next adventure, planned in seconds
                  </h1>
                  <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                    Roamly turns your destination, budget, and interests into a
                    beautiful day-by-day itinerary — with restaurants,
                    attractions, costs, and AI reasoning for every pick.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {FEATURES.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-white/70 bg-white/60 p-4 backdrop-blur-sm"
                    >
                      <feature.icon className="mb-3 size-5 text-primary" />
                      <h3 className="text-sm font-medium">{feature.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  Demo: plan a 5-day trip to Tokyo with a €1,500 budget in
                  under 15 seconds.
                </p>
              </section>

              <section>
                {error ? (
                  <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                <TripForm onSubmit={handleSubmit} />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
