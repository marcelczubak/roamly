import type { Activity } from "@/lib/schemas";

export type LocationInput = Pick<
  Activity,
  "venueName" | "address" | "neighborhood" | "photoQuery"
>;

export function buildLocationQueries(
  activity: LocationInput,
  tripDestination: string
): string[] {
  const queries = [
    [activity.venueName, activity.address, tripDestination].join(", "),
    [activity.venueName, activity.neighborhood, tripDestination].join(", "),
    [activity.photoQuery, tripDestination].join(", "),
    [activity.address, tripDestination].join(", "),
    [activity.venueName, tripDestination].join(", "),
    activity.photoQuery,
    activity.address,
    activity.venueName,
  ];

  return [...new Set(queries.map((query) => query.trim()).filter((q) => q.length >= 3))];
}
