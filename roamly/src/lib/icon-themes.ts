import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Coffee,
  FileDiff,
  GitBranch,
  MapPin,
  MessagesSquare,
  Target,
  TrainFront,
  UtensilsCrossed,
  Users,
  Zap,
} from "lucide-react";
import type { Activity } from "@/lib/schemas";
import { INTEREST_OPTIONS } from "@/lib/schemas";

export type IconThemeKey =
  | "terracotta"
  | "amber"
  | "green"
  | "purple"
  | "red"
  | "indigo"
  | "charcoal"
  | "blue"
  | "cyan"
  | "slate";

export type IconTheme = {
  bg: string;
  bgHover: string;
  bgSelected: string;
  border: string;
  borderSelected: string;
  icon: string;
  iconSelected: string;
  ring: string;
  labelSelected: string;
};

export const ICON_THEMES: Record<IconThemeKey, IconTheme> = {
  terracotta: {
    bg: "bg-orange-50",
    bgHover: "hover:bg-orange-100",
    bgSelected: "bg-orange-200",
    border: "border-orange-200/80",
    borderSelected: "border-orange-500",
    icon: "text-orange-700",
    iconSelected: "text-orange-900",
    ring: "ring-orange-400",
    labelSelected: "text-orange-800",
  },
  amber: {
    bg: "bg-amber-50",
    bgHover: "hover:bg-amber-100",
    bgSelected: "bg-amber-200",
    border: "border-amber-200/80",
    borderSelected: "border-amber-500",
    icon: "text-amber-700",
    iconSelected: "text-amber-900",
    ring: "ring-amber-400",
    labelSelected: "text-amber-800",
  },
  green: {
    bg: "bg-emerald-50",
    bgHover: "hover:bg-emerald-100",
    bgSelected: "bg-emerald-200",
    border: "border-emerald-200/80",
    borderSelected: "border-emerald-500",
    icon: "text-emerald-700",
    iconSelected: "text-emerald-900",
    ring: "ring-emerald-400",
    labelSelected: "text-emerald-800",
  },
  purple: {
    bg: "bg-violet-50",
    bgHover: "hover:bg-violet-100",
    bgSelected: "bg-violet-200",
    border: "border-violet-200/80",
    borderSelected: "border-violet-500",
    icon: "text-violet-700",
    iconSelected: "text-violet-900",
    ring: "ring-violet-400",
    labelSelected: "text-violet-800",
  },
  red: {
    bg: "bg-rose-50",
    bgHover: "hover:bg-rose-100",
    bgSelected: "bg-rose-200",
    border: "border-rose-200/80",
    borderSelected: "border-rose-500",
    icon: "text-rose-700",
    iconSelected: "text-rose-900",
    ring: "ring-rose-400",
    labelSelected: "text-rose-800",
  },
  indigo: {
    bg: "bg-indigo-50",
    bgHover: "hover:bg-indigo-100",
    bgSelected: "bg-indigo-200",
    border: "border-indigo-200/80",
    borderSelected: "border-indigo-500",
    icon: "text-indigo-700",
    iconSelected: "text-indigo-900",
    ring: "ring-indigo-400",
    labelSelected: "text-indigo-800",
  },
  charcoal: {
    bg: "bg-stone-100",
    bgHover: "hover:bg-stone-200",
    bgSelected: "bg-stone-300",
    border: "border-stone-300/80",
    borderSelected: "border-stone-600",
    icon: "text-stone-600",
    iconSelected: "text-stone-900",
    ring: "ring-stone-500",
    labelSelected: "text-stone-800",
  },
  blue: {
    bg: "bg-sky-50",
    bgHover: "hover:bg-sky-100",
    bgSelected: "bg-sky-200",
    border: "border-sky-200/80",
    borderSelected: "border-sky-500",
    icon: "text-sky-700",
    iconSelected: "text-sky-900",
    ring: "ring-sky-400",
    labelSelected: "text-sky-800",
  },
  cyan: {
    bg: "bg-cyan-50",
    bgHover: "hover:bg-cyan-100",
    bgSelected: "bg-cyan-200",
    border: "border-cyan-200/80",
    borderSelected: "border-cyan-500",
    icon: "text-cyan-700",
    iconSelected: "text-cyan-900",
    ring: "ring-cyan-400",
    labelSelected: "text-cyan-800",
  },
  slate: {
    bg: "bg-slate-50",
    bgHover: "hover:bg-slate-100",
    bgSelected: "bg-slate-200",
    border: "border-slate-200/80",
    borderSelected: "border-slate-500",
    icon: "text-slate-600",
    iconSelected: "text-slate-900",
    ring: "ring-slate-400",
    labelSelected: "text-slate-800",
  },
};

export type ThemedIconItem = {
  id: string;
  label: string;
  theme: IconThemeKey;
  icon: LucideIcon;
};

/** Full-spectrum colour mapping — one distinct hue per interest. */
export const INTEREST_ICON_MAP: Record<
  (typeof INTEREST_OPTIONS)[number],
  ThemedIconItem
> = {
  Cafés: { id: "Cafés", label: "Cafés", theme: "terracotta", icon: Coffee },
  Food: { id: "Food", label: "Food", theme: "amber", icon: UtensilsCrossed },
  Nature: { id: "Nature", label: "Nature", theme: "green", icon: Target },
  Museums: { id: "Museums", label: "Museums", theme: "purple", icon: MessagesSquare },
  Nightlife: { id: "Nightlife", label: "Nightlife", theme: "red", icon: Users },
  Shopping: { id: "Shopping", label: "Shopping", theme: "indigo", icon: Briefcase },
  History: { id: "History", label: "History", theme: "charcoal", icon: FileDiff },
  Art: { id: "Art", label: "Art", theme: "blue", icon: GitBranch },
  Adventure: { id: "Adventure", label: "Adventure", theme: "cyan", icon: Zap },
};

export const CATEGORY_ICON_ITEMS: Record<
  Activity["category"],
  ThemedIconItem
> = {
  cafe: { id: "cafe", label: "Café", theme: "terracotta", icon: Coffee },
  food: { id: "food", label: "Food", theme: "amber", icon: UtensilsCrossed },
  nature: { id: "nature", label: "Nature", theme: "green", icon: Target },
  museum: { id: "museum", label: "Museum", theme: "purple", icon: MessagesSquare },
  attraction: { id: "attraction", label: "Attraction", theme: "blue", icon: GitBranch },
  nightlife: { id: "nightlife", label: "Nightlife", theme: "red", icon: Users },
  shopping: { id: "shopping", label: "Shopping", theme: "indigo", icon: Briefcase },
  transport: { id: "transport", label: "Transport", theme: "slate", icon: TrainFront },
};

export function getInterestIconItem(interest: string): ThemedIconItem | undefined {
  return INTEREST_ICON_MAP[interest as (typeof INTEREST_OPTIONS)[number]];
}

export function getCategoryIconItem(
  category: Activity["category"]
): ThemedIconItem {
  return CATEGORY_ICON_ITEMS[category];
}

export const ORDERED_INTEREST_ITEMS = INTEREST_OPTIONS.map(
  (interest) => INTEREST_ICON_MAP[interest]
);

export const DEFAULT_TOOLBAR_ICONS: ThemedIconItem[] = [
  { id: "1", label: "Quick", theme: "slate", icon: Zap },
  { id: "2", label: "Target", theme: "green", icon: Target },
  { id: "3", label: "Flow", theme: "blue", icon: GitBranch },
  { id: "4", label: "Chat", theme: "purple", icon: MessagesSquare },
  { id: "5", label: "Building", theme: "terracotta", icon: Building2 },
  { id: "6", label: "People", theme: "red", icon: Users },
  { id: "7", label: "Work", theme: "indigo", icon: Briefcase },
  { id: "8", label: "Document", theme: "charcoal", icon: FileDiff },
];

export const MAP_PIN_ITEM: ThemedIconItem = {
  id: "map",
  label: "Location",
  theme: "slate",
  icon: MapPin,
};
