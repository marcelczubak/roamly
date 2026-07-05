const FETCH_TIMEOUT_MS = 6000;
const USER_AGENT = "Roamly/1.0 (https://github.com/marcelczubak/roamly)";

const CATEGORY_COMMONS_SUFFIXES: Record<string, string[]> = {
  museum: ["exterior", "building facade", "entrance"],
  attraction: ["exterior", "landmark building", "facade"],
  food: ["restaurant exterior", "storefront"],
  cafe: ["cafe exterior", "coffee shop"],
  nature: ["park landscape", "garden view"],
  nightlife: ["bar exterior", "street at night"],
  shopping: ["market exterior", "shopping street"],
  transport: ["station exterior", "transport hub"],
};

type PlaceImageOptions = {
  category?: string;
  destination?: string;
  venueName?: string;
};

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        ...init?.headers,
      },
    });
    return response.ok ? response : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isPhotoUrl(url: string) {
  return /\.(jpe?g|png|webp)(\?|$)/i.test(url);
}

function isBadImageTitle(title: string) {
  return /\b(map|logo|icon|flag|svg|seal|coat of arms|diagram|chart|graph|pictogram|locator|emblem|banner|signature|autograph|portrait|coin|medal|stamp sheet)\b/i.test(
    title
  );
}

function scoreImageTitle(title: string, category: string) {
  let score = 0;

  if (/\b(exterior|facade|building|front|entrance|street view|storefront)\b/i.test(title)) {
    score += 12;
  }
  if (/\b(view|panorama|aerial|skyline|landscape)\b/i.test(title)) {
    score += 4;
  }
  if (/\b(interior|artifact|exhibit|collection|display case|sculpture detail)\b/i.test(title)) {
    score -= category === "museum" || category === "attraction" ? 8 : 2;
  }
  if (/\b(food|dish|meal|plate|drink)\b/i.test(title)) {
    score -= category === "food" || category === "cafe" ? 0 : 6;
  }

  return score;
}

function buildSearchAttempts(
  photoQuery: string,
  options?: PlaceImageOptions
): string[] {
  const { venueName, destination } = options ?? {};
  const attempts = [
    photoQuery,
    venueName,
    venueName && destination ? `${venueName}, ${destination}` : null,
    venueName && destination ? `${venueName} ${destination}` : null,
    photoQuery.split(",")[0]?.trim(),
    photoQuery.split("–")[0]?.trim(),
    photoQuery.split("-")[0]?.trim(),
    photoQuery.split(" ").slice(0, 5).join(" "),
  ].filter((value): value is string => Boolean(value && value.length >= 3));

  return [...new Set(attempts)];
}

function isLikelyLogo(url: string) {
  return /\/wikipedia\/en\//i.test(url);
}

async function fetchWikiSummary(title: string) {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const response = await fetchWithTimeout(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  );

  if (!response) {
    return null;
  }

  const data = (await response.json()) as {
    thumbnail?: { source?: string };
    originalimage?: { source?: string };
  };

  const url = data.originalimage?.source ?? data.thumbnail?.source ?? null;
  if (!url || !isPhotoUrl(url) || isLikelyLogo(url)) {
    return null;
  }

  return url;
}

async function searchWikiTitle(query: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", query);
  url.searchParams.set("limit", "3");
  url.searchParams.set("format", "json");

  const response = await fetchWithTimeout(url.toString());
  if (!response) {
    return null;
  }

  const [, titles] = (await response.json()) as [string, string[]];
  return titles.filter(Boolean);
}

async function fetchWikimediaPhotos(
  search: string,
  category: string
): Promise<string | null> {
  const wikiUrl = new URL("https://commons.wikimedia.org/w/api.php");
  wikiUrl.searchParams.set("action", "query");
  wikiUrl.searchParams.set("format", "json");
  wikiUrl.searchParams.set("generator", "search");
  wikiUrl.searchParams.set("gsrsearch", search);
  wikiUrl.searchParams.set("gsrnamespace", "6");
  wikiUrl.searchParams.set("gsrlimit", "8");
  wikiUrl.searchParams.set("prop", "imageinfo");
  wikiUrl.searchParams.set("iiprop", "url|thumbnail|mime");
  wikiUrl.searchParams.set("iiurlwidth", "640");

  const response = await fetchWithTimeout(wikiUrl.toString());
  if (!response) {
    return null;
  }

  const data = await response.json();
  const pages = data.query?.pages;
  if (!pages) {
    return null;
  }

  let bestUrl: string | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const page of Object.values(pages) as Array<{
    title?: string;
    imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string }>;
  }>) {
    const title = page.title ?? "";
    if (isBadImageTitle(title)) {
      continue;
    }

    const info = page.imageinfo?.[0];
    const candidate = info?.thumburl ?? info?.url;
    if (!candidate || !isPhotoUrl(candidate)) {
      continue;
    }
    if (info?.mime && !info.mime.startsWith("image/")) {
      continue;
    }

    const score = scoreImageTitle(title, category);
    if (score > bestScore) {
      bestScore = score;
      bestUrl = candidate;
    }
  }

  return bestUrl;
}

function buildCommonsSearches(
  photoQuery: string,
  category: string,
  options?: PlaceImageOptions
): string[] {
  const placeName =
    options?.venueName?.trim() ||
    photoQuery.split(",")[0]?.trim() ||
    photoQuery.trim();
  const destination = options?.destination?.trim();
  const suffixes = CATEGORY_COMMONS_SUFFIXES[category] ?? ["exterior", "building"];

  const searches = [
    `${placeName} ${suffixes[0]}`,
    `${placeName} ${suffixes[1] ?? "building"}`,
    destination ? `${placeName} ${destination} ${suffixes[0]}` : null,
    destination ? `${placeName} ${destination}` : null,
    placeName,
  ].filter((value): value is string => Boolean(value && value.length >= 3));

  return [...new Set(searches)];
}

export async function fetchPlaceImage(
  photoQuery: string,
  options?: PlaceImageOptions
): Promise<string | null> {
  const category = options?.category ?? "attraction";
  const attempts = buildSearchAttempts(photoQuery, options);
  const seenTitles = new Set<string>();

  for (const attempt of attempts) {
    const direct = await fetchWikiSummary(attempt);
    if (direct) {
      return direct;
    }

    const titles = await searchWikiTitle(attempt);
    if (!titles) {
      continue;
    }

    for (const title of titles) {
      if (seenTitles.has(title)) {
        continue;
      }
      seenTitles.add(title);

      const found = await fetchWikiSummary(title);
      if (found) {
        return found;
      }
    }
  }

  for (const search of buildCommonsSearches(photoQuery, category, options)) {
    const found = await fetchWikimediaPhotos(search, category);
    if (found) {
      return found;
    }
  }

  return null;
}
