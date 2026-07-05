"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { motionTransition } from "@/lib/motion";

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
            transition={motionTransition.backdrop}
            className="absolute inset-0"
          >
            {/* Hero: two layers — soft colour base + lighter detail so the city reads through */}
            {variant === "hero" ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover opacity-[0.38] blur-[72px] saturate-[2.25] contrast-[1.08]"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.5] blur-[26px] saturate-[2.1] contrast-[1.1]"
                />
              </>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-[0.52] blur-[36px] saturate-[1.9] contrast-[1.06]"
              />
            )}
            <div className="absolute inset-0 bg-stone-50/45" />
            <div className="absolute inset-0 bg-linear-to-b from-stone-50/20 via-stone-50/35 to-stone-50/25" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
