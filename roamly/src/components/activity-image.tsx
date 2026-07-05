"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getCategoryIconItem, ICON_THEMES } from "@/lib/icon-themes";
import type { Activity } from "@/lib/schemas";

type ActivityImageProps = {
  query: string;
  category: Activity["category"];
  title: string;
  venueName?: string;
  destination?: string;
};

export function ActivityImage({
  query,
  category,
  title,
  venueName,
  destination,
}: ActivityImageProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const categoryItem = getCategoryIconItem(category);
  const theme = ICON_THEMES[categoryItem.theme];
  const CategoryIcon = categoryItem.icon;

  useEffect(() => {
    setSrc(null);
    setFailed(false);

    const params = new URLSearchParams({ q: query, category });
    if (venueName) params.set("venue", venueName);
    if (destination) params.set("destination", destination);

    fetch(`/api/place-image?${params}`)
      .then((response) => response.json())
      .then((data: { url?: string | null }) => {
        if (data.url) setSrc(data.url);
      })
      .catch(() => setFailed(true));
  }, [query, category, venueName, destination]);

  return (
    <div
      className={cn(
        "relative size-24 shrink-0 overflow-hidden rounded-xl border sm:size-28",
        theme.border,
        theme.bg
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={title}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1">
          <CategoryIcon className={cn("size-6", theme.icon)} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
