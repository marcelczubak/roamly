import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ActivitySchema = z.object({
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.number(),
  category: z.enum([
    "food",
    "attraction",
    "nature",
    "museum",
    "nightlife",
    "shopping",
    "transport",
  ]),
  reasoning: z.string(),
});

const DaySchema = z.object({
  day: z.number(),
  theme: z.string(),
  activities: z.array(ActivitySchema),
  dailyTotal: z.number(),
});

const ItinerarySchema = z.object({
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

export async function POST(req: Request) {
  const body = await req.json();
  const { destination, budget, days, style, interests } = body;

  const response = await openai.chat.completions.parse({
    model: "gpt-5.5",
    messages: [
      {
        role: "system",
        content: `You are an expert travel planner. Create a realistic ${days}-day itinerary for ${destination} with a ${style} budget of €${budget}. Interests: ${interests.join(", ")}. Always return valid JSON matching the schema.`,
      },
      {
        role: "user",
        content: `Plan my trip.`,
      },
    ],
    response_format: zodResponseFormat(ItinerarySchema, "itinerary"),
  });

  return NextResponse.json(response.choices[0].message.parsed);
}