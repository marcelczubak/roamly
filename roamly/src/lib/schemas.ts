import { z } from "zod";

export const TRAVEL_STYLES = ["backpacker", "mid-range", "luxury"] as const;
export const INTEREST_OPTIONS = [
  "Cafés",
  "Food",
  "Nature",
  "Museums",
  "Nightlife",
  "Shopping",
  "History",
  "Art",
  "Adventure",
] as const;

export const ActivitySchema = z.object({
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.number(),
  category: z.enum([
    "cafe",
    "food",
    "attraction",
    "nature",
    "museum",
    "nightlife",
    "shopping",
    "transport",
  ]),
  imageQuery: z.string(),
  reasoning: z.string(),
});

export const DaySchema = z.object({
  day: z.number(),
  theme: z.string(),
  activities: z.array(ActivitySchema),
  dailyTotal: z.number(),
});

export const ItinerarySchema = z.object({
  summary: z.string(),
  budgetBreakdown: z.object({
    accommodation: z.number(),
    food: z.number(),
    activities: z.number(),
    transport: z.number(),
    buffer: z.number(),
  }),
  days: z.array(DaySchema),
  totalEstimatedCost: z.number(),
});

export const TripRequestSchema = z.object({
  destination: z.string().min(2),
  budget: z.number().positive(),
  travelers: z.number().int().min(1).max(10),
  days: z.number().int().min(1).max(14),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  style: z.enum(TRAVEL_STYLES),
  interests: z.array(z.string()).min(1),
});

export const DayWeatherSchema = z.object({
  date: z.string(),
  day: z.number(),
  tempMax: z.number(),
  tempMin: z.number(),
  precipitation: z.number(),
  description: z.string(),
  weatherCode: z.number(),
});

export const GenerateResponseSchema = ItinerarySchema.extend({
  startDate: z.string(),
  weather: z.array(DayWeatherSchema),
});

export type TripRequest = z.infer<typeof TripRequestSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
export type DayPlan = z.infer<typeof DaySchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type DayWeather = z.infer<typeof DayWeatherSchema>;
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
