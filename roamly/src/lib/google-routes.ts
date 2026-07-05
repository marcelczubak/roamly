import { buildLocationQueries, type LocationInput } from "@/lib/location-queries";
import { buildRideshareLinks } from "@/lib/rideshare-links";
import { estimateTaxiFare } from "@/lib/taxi-fare";
import { estimateTransitFare } from "@/lib/transit-fare";
import type { RouteComparison, RouteMode, RouteOption } from "@/lib/route-types";

type RoutesTravelMode = "WALK" | "TRANSIT" | "DRIVE";

type RoutesApiRoute = {
  distanceMeters?: number;
  duration?: string;
  description?: string;
  travelAdvisory?: {
    transitFare?: {
      currencyCode?: string;
      units?: string;
      nanos?: number;
    };
  };
};

type RoutesApiResponse = {
  routes?: RoutesApiRoute[];
  error?: { message?: string; status?: string };
};

function parseDurationSeconds(duration?: string) {
  if (!duration) {
    return 0;
  }
  const match = duration.match(/^(\d+)s$/);
  return match ? Number(match[1]) : 0;
}

function parseTransitFare(fare?: RoutesApiRoute["travelAdvisory"] extends infer T
  ? T extends { transitFare?: infer F }
    ? F
    : never
  : never) {
  if (!fare?.currencyCode || fare.units === undefined) {
    return null;
  }

  const units = Number(fare.units);
  const nanos = fare.nanos ?? 0;

  if (Number.isNaN(units)) {
    return null;
  }

  return {
    cost: units + nanos / 1_000_000_000,
    currency: fare.currencyCode,
  };
}

function buildMapsDirUrl(origin: string, destination: string, mode: RouteMode) {
  const travelMode =
    mode === "taxi" ? "driving" : mode === "transit" ? "transit" : "walking";
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: travelMode,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildEmbedUrl(origin: string, destination: string, mode: RouteMode) {
  if (mode === "taxi") {
    return null;
  }

  // Public Google Maps embed — no Maps Embed API key required
  const dirflg = mode === "transit" ? "r" : "w";
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    dirflg,
    ie: "UTF8",
    output: "embed",
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

function formatCost(cost: number | null, currency: string) {
  if (cost === null) {
    return "Varies";
  }
  if (cost === 0) {
    return "Free";
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(cost);
  } catch {
    return `${currency} ${cost}`;
  }
}

function toRouteOption(
  mode: RouteMode,
  origin: string,
  destination: string,
  apiKey: string,
  tripDestination: string,
  data: {
    distanceMeters: number;
    durationMinutes: number;
    cost: number | null;
    currency: string;
    summary: string | null;
  }
): RouteOption {
  return {
    mode,
    distanceMeters: data.distanceMeters,
    durationMinutes: data.durationMinutes,
    cost: data.cost,
    currency: data.currency,
    costLabel: formatCost(data.cost, data.currency),
    summary: data.summary,
    mapsUrl: buildMapsDirUrl(origin, destination, mode),
    embedUrl: buildEmbedUrl(origin, destination, mode),
    rideshareLinks:
      mode === "taxi"
        ? buildRideshareLinks(origin, destination, tripDestination)
        : undefined,
  };
}

async function computeRoute(
  apiKey: string,
  origin: string,
  destination: string,
  travelMode: RoutesTravelMode
) {
  const body: Record<string, unknown> = {
    origin: { address: origin },
    destination: { address: destination },
    travelMode,
    languageCode: "en-US",
    units: "METRIC",
  };

  if (travelMode === "TRANSIT") {
    body.transitPreferences = { routingPreference: "LESS_WALKING" };
  }

  const fieldMask =
    travelMode === "TRANSIT"
      ? "routes.duration,routes.distanceMeters,routes.description,routes.travelAdvisory.transitFare"
      : "routes.duration,routes.distanceMeters,routes.description";

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (
      response.status === 403 ||
      errorText.includes("PERMISSION_DENIED") ||
      errorText.includes("API key not authorized") ||
      errorText.includes("API_KEY_INVALID")
    ) {
      throw new Error(
        "Google Maps API key is restricted. Enable Routes API and set key restrictions to allow it — server-side calls need IP or no application restriction, not HTTP referrers only."
      );
    }
    return null;
  }

  const data = (await response.json()) as RoutesApiResponse;
  const route = data.routes?.[0];

  if (!route?.distanceMeters) {
    return null;
  }

  const durationSeconds = parseDurationSeconds(route.duration);

  return {
    distanceMeters: route.distanceMeters,
    durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    description: route.description ?? null,
    transitFare: parseTransitFare(route.travelAdvisory?.transitFare),
  };
}

async function computeAllModes(
  apiKey: string,
  origin: string,
  destination: string,
  tripDestination: string
) {
  const [walking, transit, driving] = await Promise.all([
    computeRoute(apiKey, origin, destination, "WALK"),
    computeRoute(apiKey, origin, destination, "TRANSIT"),
    computeRoute(apiKey, origin, destination, "DRIVE"),
  ]);

  if (!walking && !transit && !driving) {
    return null;
  }

  const options: RouteOption[] = [];

  if (walking) {
    options.push(
      toRouteOption("walking", origin, destination, apiKey, tripDestination, {
        distanceMeters: walking.distanceMeters,
        durationMinutes: walking.durationMinutes,
        cost: 0,
        currency: "EUR",
        summary: walking.description,
      })
    );
  }

  if (transit) {
    const fare = transit.transitFare ?? estimateTransitFare(tripDestination);
    options.push(
      toRouteOption("transit", origin, destination, apiKey, tripDestination, {
        distanceMeters: transit.distanceMeters,
        durationMinutes: transit.durationMinutes,
        cost: fare.cost,
        currency: fare.currency,
        summary: transit.description,
      })
    );
  }

  if (driving) {
    const taxi = estimateTaxiFare(
      tripDestination,
      driving.distanceMeters,
      driving.durationMinutes
    );

    options.push(
      toRouteOption("taxi", origin, destination, apiKey, tripDestination, {
        distanceMeters: driving.distanceMeters,
        durationMinutes: driving.durationMinutes,
        cost: taxi.cost,
        currency: taxi.currency,
        summary: driving.description,
      })
    );
  }

  return { from: origin, to: destination, options };
}

async function resolveRoutePair(
  apiKey: string,
  originQueries: string[],
  destinationQueries: string[],
  tripDestination: string
) {
  const pairs: Array<[string, string]> = [];

  for (const origin of originQueries.slice(0, 4)) {
    for (const destination of destinationQueries.slice(0, 4)) {
      pairs.push([origin, destination]);
    }
  }

  const uniquePairs = pairs.filter(
    ([origin, destination], index) =>
      pairs.findIndex(([o, d]) => o === origin && d === destination) === index
  );

  for (const [origin, destination] of uniquePairs.slice(0, 4)) {
    const result = await computeAllModes(
      apiKey,
      origin,
      destination,
      tripDestination
    );
    if (result) {
      return result;
    }
  }

  return null;
}

export async function compareRoutes(
  originActivity: LocationInput,
  destinationActivity: LocationInput,
  tripDestination: string
): Promise<RouteComparison> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY");
  }

  const originQueries = buildLocationQueries(originActivity, tripDestination);
  const destinationQueries = buildLocationQueries(
    destinationActivity,
    tripDestination
  );

  const result = await resolveRoutePair(
    apiKey,
    originQueries,
    destinationQueries,
    tripDestination
  );

  if (!result) {
    throw new Error(
      "No routes found between these locations. Try regenerating the trip for more precise addresses."
    );
  }

  return result;
}
