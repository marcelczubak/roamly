export const TRAVELERS_MIN = 1;
export const TRAVELERS_MAX = 10;

/** Rough daily spend per person (EUR) used to derive slider bounds. */
export const PER_PERSON_DAY_MIN = 25;
export const PER_PERSON_DAY_MAX = 300;
export const PER_PERSON_DAY_DEFAULT = 75;

export function budgetRange(travelers: number, days: number) {
  const min = travelers * days * PER_PERSON_DAY_MIN;
  const max = travelers * days * PER_PERSON_DAY_MAX;
  const defaultBudget = travelers * days * PER_PERSON_DAY_DEFAULT;
  const step = Math.max(25, Math.round(min / 8 / 25) * 25);

  return { min, max, defaultBudget, step };
}

export function clampBudget(value: number, travelers: number, days: number) {
  const { min, max } = budgetRange(travelers, days);
  return Math.min(max, Math.max(min, value));
}

export function perPerson(amount: number, travelers: number) {
  return travelers > 0 ? amount / travelers : amount;
}

export function formatEuro(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
