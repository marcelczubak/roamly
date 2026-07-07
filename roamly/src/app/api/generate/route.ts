import { NextResponse } from "next/server";
import { ItinerarySchema, TripRequestSchema } from "@/lib/schemas";
import { geminiErrorResponse, getModel, parseJsonResponse } from "@/lib/gemini";
import {
  fetchTripWeather,
  formatWeatherForPrompt,
  maxStartDate,
  todayString,
  type DayWeather,
} from "@/lib/weather";

type AiProvider = "gemini" | "ollama";

function getAiProvider(): AiProvider {
  return process.env.AI_PROVIDER === "ollama" ? "ollama" : "gemini";
}

function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
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
6. IMAGE QUERIES: photoQuery must be the official venue name as used on Wikipedia (e.g. "National Museum of Ireland – Archaeology", "Trinity College Dublin"). imageQuery should describe the building exterior or street view (e.g. "museum exterior Dublin", "restaurant storefront").
7. LOCAL TIPS: localTip must be a practical insider tip (best time, what to order, reservation advice, nearest metro stop).
8. GROUP COSTS: All costs are for the ENTIRE GROUP of ${travelers}, not per person.
9. Use lowercase for timeOfDay and category values exactly as listed.
10. Use category "cafe" for coffee shops; "food" for restaurants and sit-down meals.
11. Include morning, afternoon, and evening activities for each day.
12. menuItems required for "food" and "cafe", omit or empty array for other categories.
13. totalEstimatedCost should be close to but not exceed €${budget}.
14. Keep daily costs realistic for the ${style} travel style and group size.`;
}

const VALID_CATEGORIES = new Set([
  "cafe",
  "food",
  "attraction",
  "nature",
  "museum",
  "nightlife",
  "shopping",
  "transport",
]);

function normalizeCategory(category: unknown): string {
  if (typeof category !== "string" || !category.trim()) {
    return "attraction";
  }

  const lower = category.toLowerCase().trim();
  if (VALID_CATEGORIES.has(lower)) {
    return lower;
  }

  if (
    lower.includes("cafe") ||
    lower.includes("coffee") ||
    lower.includes("bakery")
  ) {
    return "cafe";
  }
  if (
    lower.includes("food") ||
    lower.includes("restaurant") ||
    lower.includes("dining") ||
    lower.includes("breakfast") ||
    lower.includes("lunch") ||
    lower.includes("dinner")
  ) {
    return "food";
  }
  if (lower.includes("museum") || lower.includes("gallery") || lower.includes("history")) {
    return "museum";
  }
  if (
    lower.includes("nature") ||
    lower.includes("park") ||
    lower.includes("garden") ||
    lower.includes("hike") ||
    lower.includes("beach")
  ) {
    return "nature";
  }
  if (
    lower.includes("night") ||
    lower.includes("bar") ||
    lower.includes("club") ||
    lower.includes("pub")
  ) {
    return "nightlife";
  }
  if (lower.includes("shop") || lower.includes("market")) {
    return "shopping";
  }
  if (
    lower.includes("transport") ||
    lower.includes("train") ||
    lower.includes("bus") ||
    lower.includes("taxi") ||
    lower.includes("flight")
  ) {
    return "transport";
  }

  return "attraction";
}

function normalizeItinerary(parsed: Record<string, unknown>, destination: string) {
  if (!parsed.days || !Array.isArray(parsed.days)) {
    return parsed;
  }

  parsed.days.forEach((day: Record<string, unknown>) => {
    if (!day.activities || !Array.isArray(day.activities)) {
      return;
    }

    day.activities.forEach((act: Record<string, unknown>) => {
      act.category = normalizeCategory(act.category);

      const title = typeof act.title === "string" ? act.title : "Local activity";
      if (!act.venueName) act.venueName = title;
      if (!act.address) act.address = destination;
      if (!act.neighborhood) act.neighborhood = "City center";
      if (!act.imageQuery) act.imageQuery = title.split(" ").slice(0, 4).join(" ");
      if (!act.photoQuery) act.photoQuery = `${act.venueName}, ${destination}`;
      if (!act.reasoning) act.reasoning = "Recommended local experience.";
      if (!act.localTip) act.localTip = "Check opening hours before visiting.";

      const category = act.category as string;
      if (
        (category === "food" || category === "cafe") &&
        (!Array.isArray(act.menuItems) || act.menuItems.length === 0)
      ) {
        act.menuItems = [{ name: "House special", price: 15, currency: "EUR" }];
      } else if (!Array.isArray(act.menuItems)) {
        act.menuItems = [];
      }
    });
  });

  return parsed;
}

async function generateWithGemini(prompt: string, destination: string) {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  return normalizeItinerary(parseJsonResponse(raw), destination);
}

async function generateWithOllama(prompt: string, destination: string) {
  const model = getOllamaModel();
  const systemPrompt = `You are an expert travel planner. Return ONLY valid JSON. Do not wrap output in markdown code fences.

STRICT RULES:
- The "category" field MUST be exactly one of: "cafe", "food", "attraction", "nature", "museum", "nightlife", "shopping", "transport".
- Never use values like "activity", "culture", "sightseeing", or "entertainment".
- Every activity must include venueName, address, neighborhood, imageQuery, photoQuery, localTip, and reasoning.
- For "food" and "cafe" activities, include menuItems with name, price, and currency.`;

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      format: "json",
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = String(data.message?.content ?? "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return normalizeItinerary(parseJsonResponse(content), destination);
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

    const prompt = buildPrompt(
      destination,
      budget,
      travelers,
      days,
      startDate,
      style,
      interests,
      weather
    );

    const provider = getAiProvider();
    let jsonResult: Record<string, unknown> | undefined;

    if (provider === "gemini") {
      try {
        jsonResult = await generateWithGemini(prompt, destination);
      } catch (geminiError) {
        console.warn("Gemini failed, falling back to Ollama:", geminiError);
      }
    }

    if (!jsonResult) {
      console.log(
        `Using Ollama (${getOllamaModel()})${
          provider === "ollama" ? " — AI_PROVIDER=ollama" : " as fallback"
        }...`
      );

      try {
        jsonResult = await generateWithOllama(prompt, destination);
      } catch (ollamaError) {
        console.error("Ollama failed:", ollamaError);
        return NextResponse.json(
          {
            error:
              provider === "ollama"
                ? "Ollama failed to generate an itinerary. Is `ollama serve` running?"
                : "Both Gemini and Ollama failed to generate an itinerary.",
          },
          { status: 500 }
        );
      }
    }

    const itinerary = ItinerarySchema.safeParse(jsonResult);

    if (!itinerary.success) {
      console.error("Itinerary validation failed:", itinerary.error.flatten());
      console.error(
        "Raw JSON from AI:",
        JSON.stringify(jsonResult).substring(0, 500)
      );
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

    const { error: errorMessage, status } = geminiErrorResponse(message);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
