const TRANSIT_FARE_ESTIMATES: Array<{ match: RegExp; fare: number; currency: string }> = [
  { match: /vienna|austria/i, fare: 2.4, currency: "EUR" },
  { match: /paris|france/i, fare: 2.15, currency: "EUR" },
  { match: /london|uk|england/i, fare: 2.8, currency: "GBP" },
  { match: /tokyo|japan/i, fare: 180, currency: "JPY" },
  { match: /new york|nyc|usa|united states/i, fare: 2.9, currency: "USD" },
  { match: /berlin|munich|germany/i, fare: 3.2, currency: "EUR" },
];

export function estimateTransitFare(destination: string) {
  for (const entry of TRANSIT_FARE_ESTIMATES) {
    if (entry.match.test(destination)) {
      return { cost: entry.fare, currency: entry.currency };
    }
  }
  return { cost: 2.5, currency: "EUR" };
}
