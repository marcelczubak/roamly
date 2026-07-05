"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { motionPage, motionTransition } from "@/lib/motion";
import { Loader2, MapPin, Utensils, Compass, Sparkles } from "lucide-react";

const MESSAGES = [
  { text: "Finding the best attractions...", icon: MapPin },
  { text: "Scouting local restaurants...", icon: Utensils },
  { text: "Mapping your daily routes...", icon: Compass },
  { text: "Adding the finishing touches...", icon: Sparkles },
];

type GenerationLoaderProps = {
  destination?: string;
};

export function GenerationLoader({ destination }: GenerationLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, 4800);

    return () => clearInterval(timer);
  }, []);

  const current = MESSAGES[index];
  const CurrentIcon = current.icon;

  return (
    <motion.div
      initial={motionPage.initial}
      animate={motionPage.animate}
      exit={motionPage.exit}
      transition={motionPage.transition}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-16"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-stone-200 blur-2xl" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-white ring-1 ring-stone-200">
          <Loader2 className="size-9 animate-spin text-stone-700" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-stone-900">
          Building your itinerary
          {destination ? (
            <span className="block text-xl font-medium text-stone-700">
              for {destination}
            </span>
          ) : null}
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Our AI is crafting a personalized plan just for you
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={motionTransition.message}
          className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600"
        >
          <CurrentIcon className="size-4 text-stone-500" />
          {current.text}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
