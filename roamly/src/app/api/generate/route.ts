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
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}

function buildPrompt(
  destination: string,
  budget: number,
  days: number,
  style: string,
  interests: string[]
) {
  return `You are an expert travel planner. Create a realistic ${days}-day itinerary for ${destination} with a ${style} travel style and a total budget of €${budget}.

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
          "description": string,
          "estimatedCost": number,
          "category": "food" | "attraction" | "nature" | "museum" | "nightlife" | "shopping" | "transport",
          "reasoning": string
        }
      ],
      "dailyTotal": number
    }
  ],
  "totalEstimatedCost": number
}

Rules:
- Include specific restaurants, attractions, and neighborhoods.
- Keep daily costs realistic for the ${style} travel style.
- Use lowercase for timeOfDay and category values exactly as listed.
- Include morning, afternoon, and evening activities for each day.
- totalEstimatedCost should be close to but not exceed €${budget}.`;
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
    const json = JSON.parse(raw);
    const itinerary = ItinerarySchema.safeParse(json);

    if (!itinerary.success) {
      return NextResponse.json(
        { error: "Failed to generate a valid itinerary. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(itinerary.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

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
