const FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok ? response : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
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
  };

  return data.thumbnail?.source ?? null;
}

async function searchWikiTitle(query: string) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetchWithTimeout(url.toString());
  if (!response) {
    return null;
  }

  const [, titles] = (await response.json()) as [string, string[]];
  return titles[0] ?? null;
}

export async function fetchPlaceImage(photoQuery: string): Promise<string | null> {
  const attempts = [
    photoQuery,
    photoQuery.split(",")[0]?.trim(),
    photoQuery.split(" ").slice(0, 4).join(" "),
  ].filter(Boolean);

  const seen = new Set<string>();

  for (const attempt of attempts) {
    if (seen.has(attempt)) {
      continue;
    }
    seen.add(attempt);

    const direct = await fetchWikiSummary(attempt);
    if (direct) {
      return direct;
    }

    const title = await searchWikiTitle(attempt);
    if (title && !seen.has(title)) {
      seen.add(title);
      const found = await fetchWikiSummary(title);
      if (found) {
        return found;
      }
    }
  }

  return null;
}
