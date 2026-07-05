import { NextResponse } from "next/server";

const USER_AGENT = "Roamly/1.0 (https://github.com/marcelczubak/roamly)";

export type CitySearchResult = {
  id: string;
  name: string;
  country: string | null;
  label: string;
  destination: string;
};

function buildLabel(name: string, admin1: string | null, country: string | null) {
  const parts = [name];
  if (admin1 && admin1 !== name) {
    parts.push(admin1);
  }
  if (country) {
    parts.push(country);
  }
  return parts.join(", ");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ cities: [] satisfies CitySearchResult[] });
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "City search unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const seen = new Set<string>();

    const cities: CitySearchResult[] = (data.results ?? [])
      .map(
        (result: {
          id: number;
          name: string;
          country?: string;
          admin1?: string;
        }) => {
          const name = result.name?.trim();
          if (!name) return null;

          const country = result.country?.trim() ?? null;
          const dedupeKey = `${name.toLowerCase()}|${country?.toLowerCase() ?? ""}`;
          if (seen.has(dedupeKey)) return null;
          seen.add(dedupeKey);

          return {
            id: String(result.id),
            name,
            country,
            label: buildLabel(name, result.admin1?.trim() ?? null, country),
            destination: name,
          };
        }
      )
      .filter((city: CitySearchResult | null): city is CitySearchResult => city !== null)
      .slice(0, 8);

    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json(
      { error: "City search failed" },
      { status: 500 }
    );
  }
}
