import { NextResponse } from "next/server";
import { z } from "zod";
import { geminiErrorResponse, getModel, parseJsonResponse } from "@/lib/gemini";
import { DaySchema, DayWeatherSchema, TripRequestSchema } from "@/lib/schemas";
import { formatWeatherForPrompt } from "@/lib/weather";

const RegenerateDayRequestSchema = z.object({
  trip: TripRequestSchema,
  dayNumber: z.number().int().min(1),
  weather: DayWeatherSchema,
  excludeVenues: z.array(z.string()).default([]),
  targetDailyBudget: z.number().positive().optional(),
  currentTheme: z.string().optional(),
});

function buildDayPrompt(
  destination: string,
  budget: number,
  travelers: number,
  style: string,
  interests: string[],
  dayNumber: number,
  weather: z.infer<typeof DayWeatherSchema>,
  excludeVenues: string[],
  targetDailyBudget?: number,
  currentTheme?: string
) {
  const weatherBlock = formatWeatherForPrompt([weather]);
  const budgetHint = targetDailyBudget
    ? `Aim for roughly €${Math.round(targetDailyBudget)} total group cost for this day.`
    : `Keep daily costs realistic for a €${budget} total trip budget.`;

  const excludeBlock =
    excludeVenues.length > 0
      ? `\nDo NOT recommend these venues (already planned on other days):\n${excludeVenues.map((venue) => `- ${venue}`).join("\n")}\n`
      : "";

  const themeHint = currentTheme
    ? `\nThe previous plan for this day had the theme "${currentTheme}" — create a fresh alternative theme and different venues.\n`
    : "";

  return `You are a hyper-specific local travel expert for ${destination}. Use Google Search to verify real venues, current admission prices, and menu prices before recommending them.

Regenerate ONLY day ${dayNumber} of a ${destination} itinerary for a group of ${travelers} ${travelers === 1 ? "person" : "people"} with a ${style} travel style.

The group is interested in: ${interests.join(", ")}.

Weather for this day:
${weatherBlock}

${budgetHint}
${themeHint}${excludeBlock}
Tailor activities to the weather:
- Rainy or high precipitation: prioritize museums, covered markets, cafés, and indoor attractions.
- Clear or sunny: prioritize parks, walking tours, outdoor viewpoints, and nature.
- Cold days: favor cozy restaurants, indoor culture, shorter outdoor segments.
- Hot days: schedule outdoor activities in the morning/evening, shade and indoor midday breaks.

Return ONLY valid JSON for a single day with this exact structure:
{
  "day": ${dayNumber},
  "theme": string,
  "activities": [
    {
      "timeOfDay": "morning" | "afternoon" | "evening",
      "title": string,
      "venueName": string,
      "address": string,
      "neighborhood": string,
      "description": string,
      "estimatedCost": number,
      "category": "cafe" | "food" | "attraction" | "nature" | "museum" | "nightlife" | "shopping" | "transport",
      "imageQuery": string,
      "reasoning": string,
      "menuItems": [
        { "name": string, "price": number, "currency": string }
      ],
      "photoQuery": string,
      "localTip": string
    }
  ],
  "dailyTotal": number
}

CRITICAL RULES:
1. REAL PLACES ONLY with verified names, addresses, and neighborhoods.
2. Include morning, afternoon, and evening activities.
3. menuItems required for "food" and "cafe", omit or empty array for other categories.
4. All costs are for the ENTIRE GROUP of ${travelers}.
5. photoQuery must be the official Wikipedia-style venue name; imageQuery should describe the building exterior.
6. dailyTotal must equal the sum of activity estimatedCost values.
7. Use lowercase for timeOfDay and category values exactly as listed.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegenerateDayRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid regenerate request." },
        { status: 400 }
      );
    }

    const {
      trip,
      dayNumber,
      weather,
      excludeVenues,
      targetDailyBudget,
      currentTheme,
    } = parsed.data;

    if (dayNumber > trip.days) {
      return NextResponse.json({ error: "Invalid day number." }, { status: 400 });
    }

    const model = getModel();
    const result = await model.generateContent(
      buildDayPrompt(
        trip.destination,
        trip.budget,
        trip.travelers,
        trip.style,
        trip.interests,
        dayNumber,
        weather,
        excludeVenues,
        targetDailyBudget,
        currentTheme
      )
    );

    const raw = result.response.text();
    const json = parseJsonResponse(raw);
    const day = DaySchema.safeParse(json);

    if (!day.success) {
      console.error("Day validation failed:", day.error.flatten());
      return NextResponse.json(
        { error: "Failed to generate a valid day plan. Please try again." },
        { status: 502 }
      );
    }

    if (day.data.day !== dayNumber) {
      return NextResponse.json(
        { day: { ...day.data, day: dayNumber } },
        { status: 200 }
      );
    }

    return NextResponse.json({ day: day.data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    console.error("Regenerate day error:", message);

    const { error: errorMessage, status } = geminiErrorResponse(message);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
