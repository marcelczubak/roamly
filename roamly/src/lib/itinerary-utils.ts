import type { DayPlan, GenerateResponse } from "@/lib/schemas";

export function recalculateDayTotal(day: DayPlan): DayPlan {
  return {
    ...day,
    dailyTotal: day.activities.reduce(
      (sum, activity) => sum + activity.estimatedCost,
      0
    ),
  };
}

export function recalculateItineraryTotals(
  itinerary: GenerateResponse
): GenerateResponse {
  const days = itinerary.days.map(recalculateDayTotal);
  const totalEstimatedCost = days.reduce(
    (sum, day) => sum + day.dailyTotal,
    0
  );

  return {
    ...itinerary,
    days,
    totalEstimatedCost,
  };
}

export function deleteActivityFromItinerary(
  itinerary: GenerateResponse,
  dayNumber: number,
  activityIndex: number
): GenerateResponse {
  const days = itinerary.days.map((day) => {
    if (day.day !== dayNumber) {
      return day;
    }

    return recalculateDayTotal({
      ...day,
      activities: day.activities.filter((_, index) => index !== activityIndex),
    });
  });

  return recalculateItineraryTotals({ ...itinerary, days });
}

export function replaceDayInItinerary(
  itinerary: GenerateResponse,
  updatedDay: DayPlan
): GenerateResponse {
  const days = itinerary.days.map((day) =>
    day.day === updatedDay.day ? recalculateDayTotal(updatedDay) : day
  );

  return recalculateItineraryTotals({ ...itinerary, days });
}

export function collectVenueNames(
  itinerary: GenerateResponse,
  excludeDay?: number
): string[] {
  const venues = new Set<string>();

  for (const day of itinerary.days) {
    if (day.day === excludeDay) {
      continue;
    }

    for (const activity of day.activities) {
      venues.add(activity.venueName);
    }
  }

  return [...venues];
}
