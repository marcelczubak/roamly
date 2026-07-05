"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  Euro,
  Lightbulb,
  MapPin,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { fetchPlaceImage } from "@/lib/place-image";
import { ActivityLeg } from "@/components/activity-leg";
import type { Activity, DayPlan, Itinerary, MenuItem, TripRequest } from "@/lib/schemas";

type ItineraryResultsProps = {
  itinerary: Itinerary;
  trip: TripRequest;
  onBack: () => void;
};

const CATEGORY_COLORS: Record<Activity["category"], string> = {
  food: "bg-orange-100 text-orange-700",
  attraction: "bg-blue-100 text-blue-700",
  nature: "bg-green-100 text-green-700",
  museum: "bg-purple-100 text-purple-700",
  nightlife: "bg-pink-100 text-pink-700",
  shopping: "bg-amber-100 text-amber-700",
  transport: "bg-slate-100 text-slate-700",
};

const TIME_LABELS: Record<Activity["timeOfDay"], string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function formatEuro(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

function usePlaceImage(photoQuery: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      setLoading(true);
      try {
        const url = await fetchPlaceImage(photoQuery);
        if (!cancelled) {
          setImageUrl(url);
        }
      } catch {
        if (!cancelled) {
          setImageUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadImage();

    return () => {
      cancelled = true;
    };
  }, [photoQuery]);

  return { imageUrl, loading };
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
            <span className="text-foreground">{item.name}</span>
            <span className="shrink-0 font-medium text-orange-700">
              {formatPrice(item.price, item.currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const { imageUrl, loading } = usePlaceImage(activity.photoQuery);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
      <div className="grid sm:grid-cols-[180px_1fr]">
        <div className="relative aspect-[4/3] bg-muted/40 sm:aspect-auto sm:min-h-[160px]">
          {loading ? (
            <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
              Loading photo…
            </div>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={activity.venueName}
              fill
              className="object-cover"
              sizes="180px"
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center px-3 text-center text-xs text-muted-foreground">
              {activity.venueName}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("capitalize", CATEGORY_COLORS[activity.category])}
                >
                  {activity.category}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3" />
                  {TIME_LABELS[activity.timeOfDay]}
                </span>
              </div>
              <h4 className="font-medium text-foreground">{activity.title}</h4>
              <p className="text-sm font-medium text-primary/90">
                {activity.venueName}
              </p>
              <p className="flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3 shrink-0" />
                <span>
                  {activity.address} · {activity.neighborhood}
                </span>
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-primary">
              {formatEuro(activity.estimatedCost)}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {activity.description}
          </p>

          {activity.menuItems && activity.menuItems.length > 0 ? (
            <MenuItemsList items={activity.menuItems} />
          ) : null}

          <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Local tip: </span>
            {activity.localTip}
          </p>

          <button
            type="button"
            onClick={() => setShowReasoning((current) => !current)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Lightbulb className="size-3.5" />
            Why this recommendation?
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                showReasoning && "rotate-180"
              )}
            />
          </button>

          {showReasoning ? (
            <p className="mt-2 rounded-lg bg-primary/5 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
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
  tripDestination,
}: {
  day: DayPlan;
  tripDestination: string;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-white/90 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Day {day.day}</CardTitle>
            <CardDescription className="text-sm">{day.theme}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Daily total</p>
            <p className="text-lg font-semibold text-primary">
              {formatEuro(day.dailyTotal)}
            </p>
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
                tripDestination={tripDestination}
              />
            ) : null}
            <ActivityCard activity={activity} />
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
  const remainingBudget = trip.budget - itinerary.totalEstimatedCost;
  const breakdownItems = [
    { label: "Accommodation", value: itinerary.budgetBreakdown.accommodation },
    { label: "Food", value: itinerary.budgetBreakdown.food },
    { label: "Activities", value: itinerary.budgetBreakdown.activities },
    { label: "Transport", value: itinerary.budgetBreakdown.transport },
    { label: "Buffer", value: itinerary.budgetBreakdown.buffer },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="h-9 bg-white">
          <ArrowLeft className="size-4" />
          Plan another trip
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-primary" />
          {trip.destination} · {trip.days} days · {trip.style}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Your trip overview</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {itinerary.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground">Total estimated</p>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {formatEuro(itinerary.totalEstimatedCost)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Your budget</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatEuro(trip.budget)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl p-4",
                remainingBudget >= 0 ? "bg-green-50" : "bg-red-50"
              )}
            >
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold",
                  remainingBudget >= 0 ? "text-green-700" : "text-red-600"
                )}
              >
                {formatEuro(remainingBudget)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Euro className="size-4 text-primary" />
              Budget breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{formatEuro(item.value)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="text-primary">
                {formatEuro(itinerary.totalEstimatedCost)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-semibold">Day-by-day plan</h3>
          <p className="text-sm text-muted-foreground">
            {itinerary.days.length} days planned
          </p>
        </div>

        <div className="grid gap-5">
          {itinerary.days.map((day) => (
            <DayCard key={day.day} day={day} tripDestination={trip.destination} />
          ))}
        </div>
      </div>

      <div className="flex justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 px-6 py-5 text-center">
        <div>
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <RefreshCw className="size-4" />
            Regenerate a single day
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Coming soon — swap out any day without rebuilding the full trip.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
