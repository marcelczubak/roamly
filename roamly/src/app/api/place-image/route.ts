import { NextResponse } from "next/server";

const CATEGORY_FALLBACKS: Record<string, string> = {
  cafe: "coffee shop cafe",
  food: "restaurant food dining",
  attraction: "landmark tourist attraction",
  nature: "nature landscape park",
  museum: "museum art gallery",
  nightlife: "nightlife bar city lights",
  shopping: "shopping street market",
  transport: "travel transport city",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category") ?? "attraction";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const wikiUrl = new URL("https://commons.wikimedia.org/w/api.php");
    wikiUrl.searchParams.set("action", "query");
    wikiUrl.searchParams.set("format", "json");
    wikiUrl.searchParams.set("generator", "search");
    wikiUrl.searchParams.set("gsrsearch", query);
    wikiUrl.searchParams.set("gsrnamespace", "6");
    wikiUrl.searchParams.set("gsrlimit", "3");
    wikiUrl.searchParams.set("prop", "imageinfo");
    wikiUrl.searchParams.set("iiprop", "url|thumbnail");
    wikiUrl.searchParams.set("iiurlwidth", "480");

    const response = await fetch(wikiUrl.toString(), {
      next: { revalidate: 86400 },
    });

    if (response.ok) {
      const data = await response.json();
      const pages = data.query?.pages;

      if (pages) {
        for (const page of Object.values(pages) as Array<{
          imageinfo?: Array<{ thumburl?: string; url?: string }>;
        }>) {
          const imageUrl = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
          if (imageUrl) {
            return NextResponse.json({ url: imageUrl });
          }
        }
      }
    }

    const fallbackQuery = `${query} ${CATEGORY_FALLBACKS[category] ?? "travel"}`;
    const seed = Array.from(fallbackQuery).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );

    return NextResponse.json({
      url: `https://picsum.photos/seed/${seed}/480/320`,
    });
  } catch {
    return NextResponse.json({
      url: `https://picsum.photos/seed/${encodeURIComponent(query)}/480/320`,
    });
  }
}
