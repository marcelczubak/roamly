import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchTripWeather, maxStartDate, todayString } from "@/lib/weather";

const WeatherQuerySchema = z.object({
  destination: z.string().min(2),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.coerce.number().int().min(1).max(14),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsed = WeatherQuerySchema.safeParse({
    destination: searchParams.get("destination"),
    startDate: searchParams.get("startDate"),
    days: searchParams.get("days"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { destination, startDate, days } = parsed.data;
  const today = todayString();
  const latestStart = maxStartDate(days);

  if (startDate < today || startDate > latestStart) {
    return NextResponse.json(
      {
        error: `Dates must be between ${today} and ${latestStart} (forecast limit).`,
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

  return NextResponse.json({ weather });
}
