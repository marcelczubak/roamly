"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  Bus,
  Car,
  ExternalLink,
  Footprints,
  Loader2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance, formatDuration } from "@/lib/route-utils";
import type { RouteComparison, RouteMode, RouteOption } from "@/lib/route-types";
import type { Activity } from "@/lib/schemas";

type ActivityLegProps = {
  from: Activity;
  to: Activity;
  tripDestination: string;
};

const MODE_CONFIG: Record<
  RouteMode,
  { label: string; icon: typeof Footprints; description: string }
> = {
  walking: {
    label: "Walk",
    icon: Footprints,
    description: "On foot",
  },
  transit: {
    label: "Transit",
    icon: Bus,
    description: "Public transport",
  },
  taxi: {
    label: "Taxi",
    icon: Car,
    description: "Estimated taxi fare",
  },
};

function RouteModeCard({
  option,
  selected,
  onSelect,
}: {
  option: RouteOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const config = MODE_CONFIG[option.mode];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border px-3 py-2 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border/60 bg-white hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        <span>{formatDuration(option.durationMinutes)}</span>
        <span>{formatDistance(option.distanceMeters)}</span>
        <span className="font-medium text-foreground">{option.costLabel}</span>
      </div>
      {option.summary ? (
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
          {option.summary}
        </p>
      ) : null}
    </button>
  );
}

export function ActivityLeg({ from, to, tripDestination }: ActivityLegProps) {
  const [routes, setRoutes] = useState<RouteComparison | null>(null);
  const [selectedMode, setSelectedMode] = useState<RouteMode>("transit");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originActivity: {
              venueName: from.venueName,
              address: from.address,
              neighborhood: from.neighborhood,
              photoQuery: from.photoQuery,
              imageQuery: from.imageQuery,
            },
            destinationActivity: {
              venueName: to.venueName,
              address: to.address,
              neighborhood: to.neighborhood,
              photoQuery: to.photoQuery,
              imageQuery: to.imageQuery,
            },
            tripDestination,
          }),
        });

        const data = (await response.json()) as RouteComparison & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load route.");
        }

        if (!cancelled) {
          setRoutes(data);
          const preferred =
            data.options.find((option) => option.mode === "transit") ??
            data.options[0];
          setSelectedMode(preferred.mode);
        }
      } catch (routeError) {
        if (!cancelled) {
          setError(
            routeError instanceof Error
              ? routeError.message
              : "Could not load route."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRoutes();

    return () => {
      cancelled = true;
    };
  }, [from, to, tripDestination]);

  const selectedOption = routes?.options.find(
    (option) => option.mode === selectedMode
  );

  return (
    <div className="relative py-1 pl-4">
      <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border/80" />
      <div className="absolute left-0 top-4 flex size-4 items-center justify-center rounded-full border border-primary/30 bg-white">
        <ArrowDown className="size-2.5 text-primary" />
      </div>

      <div className="ml-3 rounded-xl border border-dashed border-primary/25 bg-primary/[0.03] p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-primary">
            Getting from {from.venueName} to {to.venueName}
          </p>
          {selectedOption ? (
            <a
              href={selectedOption.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              Open in Maps
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Calculating routes…
          </div>
        ) : error ? (
          <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <MapPin className="mb-1 inline size-3.5" /> {error}
          </div>
        ) : routes ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {routes.options.map((option) => (
                <RouteModeCard
                  key={option.mode}
                  option={option}
                  selected={selectedMode === option.mode}
                  onSelect={() => setSelectedMode(option.mode)}
                />
              ))}
            </div>

            {selectedOption?.embedUrl ? (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <iframe
                  title={`Route from ${from.venueName} to ${to.venueName}`}
                  src={selectedOption.embedUrl}
                  className="h-44 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : null}

            {selectedOption?.mode === "taxi" ? (
              <p className="text-[11px] text-muted-foreground">
                Taxi fare is projected from local base rates, distance, and
                travel time — actual cost may vary with traffic and surcharges.
              </p>
            ) : null}

            {selectedOption?.mode === "transit" &&
            selectedOption.cost === null ? (
              <p className="text-[11px] text-muted-foreground">
                Exact transit fare unavailable for this route — check local
                operator prices or use the Maps link above.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
