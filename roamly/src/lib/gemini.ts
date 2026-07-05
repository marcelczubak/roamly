import { GoogleGenerativeAI } from "@google/generative-ai";

export function getModel() {
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

export function parseJsonResponse(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

export function geminiErrorResponse(message: string) {
  if (message.includes("Missing GEMINI_API_KEY")) {
    return {
      error: "Missing Gemini API key. Add GEMINI_API_KEY to .env.local.",
      status: 500,
    };
  }

  if (message.includes("429")) {
    return {
      error: "Gemini rate limit reached. Wait a moment and try again.",
      status: 429,
    };
  }

  if (message.includes("API key not valid") || message.includes("401")) {
    return {
      error: "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local.",
      status: 401,
    };
  }

  return {
    error: "Something went wrong while planning your trip.",
    status: 500,
  };
}
