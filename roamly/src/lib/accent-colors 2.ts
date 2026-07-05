import type { Activity } from "@/lib/schemas";

const selected =
  "border-stone-400 bg-stone-100 text-stone-800 shadow-none";
const idle =
  "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700";

export const STYLE_ACCENTS = {
  backpacker: { active: selected, idle },
  "mid-range": { active: selected, idle },
  luxury: { active: selected, idle },
} as const;

export const INTEREST_ACCENTS: Record<string, { active: string; idle: string }> =
  Object.fromEntries(
    [
      "Cafés",
      "Food",
      "Nature",
      "Museums",
      "Nightlife",
      "Shopping",
      "History",
      "Art",
      "Adventure",
    ].map((interest) => [
      interest,
      {
        active:
          "border-stone-400 bg-stone-100 text-stone-800 shadow-none",
        idle,
      },
    ])
  );

export const CATEGORY_ACCENTS: Record<
  Activity["category"],
  { badge: string; cost: string; image: string }
> = {
  cafe: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  food: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  attraction: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  nature: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  museum: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  nightlife: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  shopping: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
  transport: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
  },
};

export const FEATURE_ACCENTS = [
  { icon: "text-stone-500 bg-stone-100", card: "border-stone-200" },
  { icon: "text-stone-500 bg-stone-100", card: "border-stone-200" },
  { icon: "text-stone-500 bg-stone-100", card: "border-stone-200" },
] as const;
