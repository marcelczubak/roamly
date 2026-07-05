import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ItinerarySchema, TripRequestSchema } from "@/lib/schemas";
import {
  fetchTripWeather,
  formatWeatherForPrompt,
  maxStartDate,
  todayString,
  type DayWeather,
} from "@/lib/weather";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} } as never],
  });
}

function parseJsonResponse(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

function buildPrompt(
  destination: string,
  budget: number,
  travelers: number,
  days: number,
  startDate: string,
  style: string,
  interests: string[],
  weather: DayWeather[]
) {
  const weatherBlock = formatWeatherForPrompt(weather);
  const perPersonBudget = Math.round(budget / travelers);

  return `You are a hyper-specific local travel expert for ${destination}. Use Google Search to verify real venues, current admission prices, and menu prices before recommending them.

Create a realistic ${days}-day itinerary for ${destination} from ${startDate} with a ${style} travel style for a group of ${travelers} ${travelers === 1 ? "person" : "people"}.

Total group budget: €${budget} (about €${perPersonBudget} per person for the whole trip).

The group is interested in: ${interests.join(", ")}.

Weather forecast for the trip:
${weatherBlock}

Tailor each day's activities to the weather:
- Rainy or high precipitation days: prioritize museums, covered markets, cafés, and indoor attractions.
- Clear or sunny days: prioritize parks, walking tours, outdoor viewpoints, and nature.
- Cold days: favor cozy restaurants, indoor culture, shorter outdoor segments.
- Hot days: schedule outdoor activities in the morning/evening, shade and indoor midday breaks.
- Mention weather suitability briefly in activity reasoning where relevant.

Return ONLY valid JSON with this exact structure:
{
  "summary": string,
  "budgetBreakdown": {
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number,
    "buffer": number
  },
  "days": [
    {
      "day": number,
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
  ],
  "totalEstimatedCost": number
}

CRITICAL RULES — every activity MUST follow these:
1. REAL PLACES ONLY: Use verified business/venue names — never "a local café" or "nearby restaurant".
2. FULL ADDRESSES: Include street address with postal code where possible.
3. NEIGHBORHOODS: Name the exact district/quarter.
4. MENU PRICES FOR FOOD/CAFE: For "food" and "cafe" activities, include menuItems with 2–4 real dishes/drinks and actual menu prices in local currency.
5. ADMISSION & TICKET PRICES: For attractions/museums, state exact entry fees in description and match estimatedCost.
6. IMAGE QUERY: imageQuery is a short 2–4 word photo search phrase; photoQuery is the exact venue name + city for maps/photos.
7. LOCAL TIPS: localTip must be a practical insider tip (best time, what to order, reservation advice, nearest metro stop).
8. GROUP COSTS: All costs are for the ENTIRE GROUP of ${travelers}, not per person.
9. Use lowercase for timeOfDay and category values exactly as listed.
10. Use category "cafe" for coffee shops; "food" for restaurants and sit-down meals.
11. Include morning, afternoon, and evening activities for each day.
12. menuItems required for "food" and "cafe", omit or empty array for other categories.
13. totalEstimatedCost should be close to but not exceed €${budget}.
14. Keep daily costs realistic for the ${style} travel style and group size.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = TripRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid trip details. Check all fields and try again." },
        { status: 400 }
      );
    }

    const { destination, budget, travelers, days, startDate, style, interests } =
      parsed.data;

    const today = todayString();
    const latestStart = maxStartDate(days);

    if (startDate < today || startDate > latestStart) {
      return NextResponse.json(
        {
          error: `Trip must start between ${today} and ${latestStart} (weather forecast limit).`,
        },
        { status: 400 }
      );
    }

    const weather = await fetchTripWeather(destination, startDate, days);

    if (!weather) {
      return NextResponse.json(
        { error: "Could not fetch weather for this destination." },
        { status: 404 }
      );
    }

    const model = getModel();

    const result = await model.generateContent(
      buildPrompt(
        destination,
        budget,
        travelers,
        days,
        startDate,
        style,
        interests,
        weather
      )
    );

    const raw = result.response.text();
    const json = parseJsonResponse(raw);
    const itinerary = ItinerarySchema.safeParse(json);

    if (!itinerary.success) {
      console.error("Itinerary validation failed:", itinerary.error.flatten());
      return NextResponse.json(
        { error: "Failed to generate a valid itinerary. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...itinerary.data,
      startDate,
      weather,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    console.error("Generate itinerary error:", message);

    if (message.includes("Missing GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "Missing Gemini API key. Add GEMINI_API_KEY to .env.local." },
        { status: 500 }
      );
    }

    if (message.includes("429")) {
      return NextResponse.json(
        {
          error: "Gemini rate limit reached. Wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    if (message.includes("API key not valid") || message.includes("401")) {
      return NextResponse.json(
        { error: "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while planning your trip." },
      { status: 500 }
    );
  }
}
