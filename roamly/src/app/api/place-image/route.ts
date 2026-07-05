import { NextResponse } from "next/server";
import { fetchPlaceImage } from "@/lib/place-image";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category") ?? "attraction";
  const venueName = searchParams.get("venue") ?? undefined;
  const destination = searchParams.get("destination") ?? undefined;

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const url = await fetchPlaceImage(query, {
      category,
      venueName,
      destination,
    });

    if (url) {
      return NextResponse.json({ url });
    }

    return NextResponse.json({ url: null });
  } catch {
    return NextResponse.json({ url: null });
  }
}
