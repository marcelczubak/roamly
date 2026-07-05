import { NextResponse } from "next/server";

const USER_AGENT = "Roamly/1.0 (https://github.com/marcelczubak/roamly)";

function normalizeCityInput(city: string) {
  return city.trim().split(",")[0]?.trim() ?? city.trim();
}

async function resolveWikipediaTitle(city: string): Promise<string | null> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", city);
  url.searchParams.set("limit", "1");
  url.searchParams.set("namespace", "0");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return (data[1] as string[])?.[0] ?? null;
}

async function fetchWikipediaLeadImage(title: string): Promise<string | null> {
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;

  const response = await fetch(summaryUrl, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const original = data.originalimage?.source as string | undefined;
  const thumb = data.thumbnail?.source as string | undefined;

  return original ?? thumb ?? null;
}

function isPhotoUrl(url: string) {
  return /\.(jpe?g|png|webp)(\?|$)/i.test(url);
}

async function fetchWikimediaPhotos(
  search: string,
  width = 1920
): Promise<string[]> {
  const wikiUrl = new URL("https://commons.wikimedia.org/w/api.php");
  wikiUrl.searchParams.set("action", "query");
  wikiUrl.searchParams.set("format", "json");
  wikiUrl.searchParams.set("generator", "search");
  wikiUrl.searchParams.set("gsrsearch", search);
  wikiUrl.searchParams.set("gsrnamespace", "6");
  wikiUrl.searchParams.set("gsrlimit", "8");
  wikiUrl.searchParams.set("prop", "imageinfo");
  wikiUrl.searchParams.set("iiprop", "url|thumbnail|mime");
  wikiUrl.searchParams.set("iiurlwidth", String(width));

  const response = await fetch(wikiUrl.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];

  const data = await response.json();
  const pages = data.query?.pages;
  if (!pages) return [];

  const urls: string[] = [];

  for (const page of Object.values(pages) as Array<{
    imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string }>;
  }>) {
    const info = page.imageinfo?.[0];
    const candidate = info?.thumburl ?? info?.url;
    if (!candidate || !isPhotoUrl(candidate)) continue;
    if (info?.mime && !info.mime.startsWith("image/")) continue;
    urls.push(candidate);
  }

  return urls;
}

async function findCityBackdropImage(city: string): Promise<string | null> {
  const normalized = normalizeCityInput(city);

  const wikiTitle =
    (await resolveWikipediaTitle(normalized)) ??
    (await resolveWikipediaTitle(`${normalized} city`));

  if (wikiTitle) {
    const wikiImage = await fetchWikipediaLeadImage(wikiTitle);
    if (wikiImage) return wikiImage;
  }

  const commonsSearches = [
    `${normalized} city skyline`,
    `${normalized} panorama city`,
    `${normalized} aerial view city`,
    `${normalized} downtown`,
    `${normalized} landmark`,
  ];

  for (const search of commonsSearches) {
    const photos = await fetchWikimediaPhotos(search);
    if (photos[0]) return photos[0];
  }

  return null;
}

export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city");

  if (!city || city.trim().length < 2) {
    return NextResponse.json({ error: "Missing city" }, { status: 400 });
  }

  const trimmed = normalizeCityInput(city);

  try {
    const url = await findCityBackdropImage(trimmed);

    if (url) {
      return NextResponse.json({ url, city: trimmed });
    }

    const seed = Array.from(trimmed).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );

    return NextResponse.json({
      url: `https://picsum.photos/seed/${seed}/1920/1080`,
      city: trimmed,
      fallback: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not fetch city image" },
      { status: 500 }
    );
  }
}
