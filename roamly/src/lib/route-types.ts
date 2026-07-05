export const ROUTE_MODES = ["walking", "transit", "taxi"] as const;
export type RouteMode = (typeof ROUTE_MODES)[number];

export type RouteOption = {
  mode: RouteMode;
  distanceMeters: number;
  durationMinutes: number;
  cost: number | null;
  currency: string;
  costLabel: string;
  summary: string | null;
  mapsUrl: string;
  embedUrl: string | null;
};

export type RouteComparison = {
  from: string;
  to: string;
  options: RouteOption[];
};
