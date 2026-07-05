import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ItinerarySchema, TripRequestSchema } from "@/lib/schemas";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";

// Prefer OpenAI when an OpenAI key is present; otherwise fall back to a Gemini
// key via Gemini's OpenAI-compatible endpoint. The model can be overridden with
// OPENAI_MODEL for either provider.
const useGemini = !process.env.OPENAI_API_KEY && !!process.env.GEMINI_API_KEY;

const openai = new OpenAI(
  useGemini
    ? { apiKey: process.env.GEMINI_API_KEY, baseURL: GEMINI_BASE_URL }
    : { apiKey: process.env.OPENAI_API_KEY }
);

const MODEL =
  process.env.OPENAI_MODEL ??
  (useGemini ? "gemini-2.5-flash" : "gpt-4o-2024-08-06");

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

    const response = await openai.chat.completions.parse({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert travel planner. Create a realistic ${days}-day itinerary for ${destination} with a ${style} travel style and a total budget of €${budget}. The traveler is interested in: ${interests.join(", ")}. Include specific restaurants, attractions, and neighborhoods. Keep daily costs realistic for the travel style. Always return valid JSON matching the schema.`,
        },
        {
          role: "user",
          content: "Plan my trip.",
        },
      ],
      response_format: zodResponseFormat(ItinerarySchema, "itinerary"),
    });

    const itinerary = response.choices[0]?.message?.parsed;

    if (!itinerary) {
      return NextResponse.json(
        { error: "Failed to generate itinerary. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Itinerary generation failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while planning your trip." },
      { status: 500 }
    );
  }
}
