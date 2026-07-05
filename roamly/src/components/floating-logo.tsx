"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import { motionTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function FloatingLogo() {
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      setAtTop(y < 32);

      if (y < 48) {
        setVisible(true);
      } else if (y > lastY + 6) {
        setVisible(false);
      } else if (y < lastY - 6) {
        setVisible(true);
      }

      lastY = y;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-6 md:pt-8"
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : -16,
      }}
      transition={motionTransition.interactive}
    >
      <div className="mx-auto flex min-h-[4.5rem] max-w-6xl items-center px-6 md:min-h-[5rem]">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-stone-800 text-white shadow-sm transition-all duration-500",
              atTop ? "size-12" : "size-9"
            )}
          >
            <Globe2
              className={cn("transition-all duration-500", atTop ? "size-7" : "size-5")}
            />
          </div>
          <div>
            <p
              className={cn(
                "font-heading font-semibold leading-none tracking-tight text-stone-900 transition-all duration-500",
                atTop ? "text-4xl" : "text-lg"
              )}
            >
              Roamly
            </p>
            <p
              className={cn(
                "text-stone-500 transition-all duration-500",
                atTop ? "mt-1 text-sm" : "text-[11px]"
              )}
            >
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
