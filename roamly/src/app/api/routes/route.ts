import { NextResponse } from "next/server";
import { z } from "zod";
import { compareRoutes } from "@/lib/google-routes";

const LocationSchema = z.object({
  venueName: z.string().min(1),
  address: z.string().min(1),
  neighborhood: z.string().min(1),
  photoQuery: z.string().min(1),
});

const RouteRequestSchema = z.object({
  originActivity: LocationSchema,
  destinationActivity: LocationSchema,
  tripDestination: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RouteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid route request." },
        { status: 400 }
      );
    }

    const comparison = await compareRoutes(
      parsed.data.originActivity,
      parsed.data.destinationActivity,
      parsed.data.tripDestination
    );

    return NextResponse.json(comparison);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    if (message.includes("Missing GOOGLE_MAPS_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "Missing Google Maps API key. Add GOOGLE_MAPS_API_KEY to .env.local.",
        },
        { status: 500 }
      );
    }

    if (message.includes("Routes API is not enabled")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (message.includes("No routes found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch route information." },
      { status: 500 }
    );
  }
}
