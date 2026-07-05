"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Utensils, Compass, Sparkles } from "lucide-react";

const MESSAGES = [
  { text: "Finding the best attractions...", icon: MapPin },
  { text: "Scouting local restaurants...", icon: Utensils },
  { text: "Mapping your daily routes...", icon: Compass },
  { text: "Adding the finishing touches...", icon: Sparkles },
];

export function GenerationLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = MESSAGES[index].icon;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Loader2 className="size-9 animate-spin text-primary" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Building your itinerary
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our AI is crafting a personalized plan just for you
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm text-muted-foreground"
        >
          <CurrentIcon className="size-4 text-primary" />
          {MESSAGES[index].text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
