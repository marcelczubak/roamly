type TaxiRates = {
  base: number;
  perKm: number;
  perMin: number;
  currency: string;
};

const CITY_RATES: Array<{ match: RegExp; rates: TaxiRates }> = [
  {
    match: /tokyo|japan/i,
    rates: { base: 500, perKm: 420, perMin: 90, currency: "JPY" },
  },
  {
    match: /paris|france/i,
    rates: { base: 2.6, perKm: 1.15, perMin: 0.5, currency: "EUR" },
  },
  {
    match: /london|uk|england/i,
    rates: { base: 3.8, perKm: 2.2, perMin: 0.35, currency: "GBP" },
  },
  {
    match: /new york|nyc|usa|united states/i,
    rates: { base: 3.0, perKm: 2.5, perMin: 0.5, currency: "USD" },
  },
  {
    match: /vienna|austria/i,
    rates: { base: 4.0, perKm: 1.8, perMin: 0.45, currency: "EUR" },
  },
  {
    match: /barcelona|madrid|spain/i,
    rates: { base: 2.4, perKm: 1.15, perMin: 0.45, currency: "EUR" },
  },
  {
    match: /rome|milan|italy/i,
    rates: { base: 3.0, perKm: 1.1, perMin: 0.45, currency: "EUR" },
  },
  {
    match: /berlin|munich|germany/i,
    rates: { base: 4.0, perKm: 2.3, perMin: 0.45, currency: "EUR" },
  },
  {
    match: /amsterdam|netherlands/i,
    rates: { base: 3.19, perKm: 2.35, perMin: 0.39, currency: "EUR" },
  },
];

const DEFAULT_RATES: TaxiRates = {
  base: 3.5,
  perKm: 1.8,
  perMin: 0.4,
  currency: "EUR",
};

export function getTaxiRates(destination: string): TaxiRates {
  for (const entry of CITY_RATES) {
    if (entry.match.test(destination)) {
      return entry.rates;
    }
  }
  return DEFAULT_RATES;
}

export function estimateTaxiFare(
  destination: string,
  distanceMeters: number,
  durationMinutes: number
) {
  const rates = getTaxiRates(destination);
  const distanceKm = distanceMeters / 1000;
  const fare =
    rates.base + distanceKm * rates.perKm + durationMinutes * rates.perMin;

  return {
    cost: Math.round(fare * 100) / 100,
    currency: rates.currency,
  };
}
