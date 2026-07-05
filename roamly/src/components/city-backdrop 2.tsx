"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CityBackdropProps = {
  city: string | null;
  /** `content` keeps the image softer when the page is long (itinerary view). */
  variant?: "hero" | "content";
};

export function CityBackdrop({
  city,
  variant = "hero",
}: CityBackdropProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  useEffect(() => {
    if (!city?.trim()) {
      setImageUrl(null);
      setActiveCity(null);
      return;
    }

    const trimmed = city.trim();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ city: trimmed });
        const response = await fetch(`/api/city-backdrop?${params}`);
        const data = await response.json();

        if (response.ok && data.url) {
          setImageUrl(data.url);
          setActiveCity(trimmed);
        }
      } catch {
        setImageUrl(null);
        setActiveCity(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key={activeCity ?? imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              className={
                variant === "content"
                  ? "absolute inset-0 h-full w-full object-cover opacity-70 blur-[36px] saturate-[1.65] contrast-[1.02]"
                  : "absolute inset-0 h-full w-full object-cover opacity-[0.82] blur-[48px] saturate-[1.8] contrast-[1.04]"
              }
            />
            <div
              className={
                variant === "content"
                  ? "absolute inset-0 bg-stone-50/45"
                  : "absolute inset-0 bg-stone-50/30"
              }
            />
            <div
              className={
                variant === "content"
                  ? "absolute inset-0 bg-linear-to-b from-stone-50/30 via-stone-50/20 to-stone-50/65"
                  : "absolute inset-0 bg-linear-to-b from-stone-50/15 via-transparent to-stone-50/55"
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
