import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Roamly/1.0 (https://github.com/marcelczubak/roamly)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not resolve location" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const address = data.address ?? {};

    const city =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.county ??
      address.state;

    if (!city) {
      return NextResponse.json(
        { error: "City not found for this location" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      city,
      country: address.country ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not resolve location" },
      { status: 500 }
    );
  }
}
