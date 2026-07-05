import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ItinerarySchema, TripRequestSchema } from "@/lib/schemas";

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
  days: number,
  style: string,
  interests: string[]
) {
  return `You are a hyper-specific local travel expert for ${destination}. Use Google Search to verify real venues, current admission prices, and menu prices before recommending them.

Create a realistic ${days}-day itinerary for ${destination} with a ${style} travel style and a total budget of €${budget}.
The traveler is interested in: ${interests.join(", ")}.

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
          "category": "food" | "attraction" | "nature" | "museum" | "nightlife" | "shopping" | "transport",
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
1. REAL PLACES ONLY: Use verified business/venue names (e.g. "Tsukiji Outer Market", "Musée d'Orsay", "Dishoom King's Cross") — never "a local café" or "nearby restaurant".
2. FULL ADDRESSES: Include street address with postal code where possible (e.g. "4 Rue de la Paix, 75002 Paris, France").
3. NEIGHBORHOODS: Name the exact district/quarter (e.g. "Shibuya", "Le Marais", "Gràcia").
4. MENU PRICES FOR FOOD: For every "food" activity, include menuItems with 2–4 real dishes/drinks and their actual menu prices. Use the venue's local currency in the currency field (e.g. "JPY", "EUR", "GBP"). Search for their menu online when possible.
5. ADMISSION & TICKET PRICES: For attractions/museums, state the exact entry fee in description and match estimatedCost (search current prices).
6. PHOTO QUERY: photoQuery must be the exact venue name + city (e.g. "Senso-ji Temple Asakusa Tokyo") for image lookup.
7. LOCAL TIPS: localTip must be a practical insider tip (best time to visit, what to order, reservation advice, nearest metro stop + line).
8. DESCRIPTIONS: Write vivid, specific descriptions mentioning what to see/order/do — not generic travel prose.
9. Use lowercase for timeOfDay and category values exactly as listed.
10. Include morning, afternoon, and evening activities for each day.
11. menuItems is required for "food" category, omit or use empty array for other categories.
12. totalEstimatedCost should be close to but not exceed €${budget}.
13. Keep daily costs realistic for the ${style} travel style.`;
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

    const { destination, budget, days, style, interests } = parsed.data;
    const model = getModel();

    const result = await model.generateContent(
      buildPrompt(destination, budget, days, style, interests)
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

    return NextResponse.json(itinerary.data);
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
          error:
            "Gemini rate limit reached. Wait a moment and try again.",
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
