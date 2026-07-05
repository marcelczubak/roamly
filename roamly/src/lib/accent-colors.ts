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
  { badge: string; cost: string; image: string; card: string }
> = {
  cafe: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-orange-100/80 bg-orange-50/35",
  },
  food: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-amber-100/80 bg-amber-50/35",
  },
  attraction: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-sky-100/80 bg-sky-50/35",
  },
  nature: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-emerald-100/80 bg-emerald-50/40",
  },
  museum: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-violet-100/80 bg-violet-50/35",
  },
  nightlife: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-rose-100/80 bg-rose-50/35",
  },
  shopping: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-indigo-100/80 bg-indigo-50/35",
  },
  transport: {
    badge: "bg-stone-100 text-stone-600 border-stone-200",
    cost: "text-stone-700",
    image: "from-stone-100 to-stone-50",
    card: "border-slate-200/80 bg-slate-50/45",
  },
};

export const FEATURE_ACCENTS = [
  { icon: "text-stone-500 bg-stone-100", card: "border-stone-200" },
  { icon: "text-stone-500 bg-stone-100", card: "border-stone-200" },
  { icon: "text-stone-500 bg-stone-100", card: "border-stone-200" },
] as const;
