"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { motionTransition } from "@/lib/motion";

export function FloatingLogo() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const TOP_THRESHOLD = 48;

    function onScroll() {
      const y = window.scrollY;
      setAtTop(y < TOP_THRESHOLD);
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
        opacity: atTop ? 1 : 0,
        y: atTop ? 0 : -16,
      }}
      transition={motionTransition.interactive}
    >
      <div className="mx-auto flex min-h-[4.5rem] max-w-6xl items-center px-6 md:min-h-[5rem]">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div className="relative size-12 shrink-0">
            <Image
              src="/travel-pin.png"
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
              priority
            />
          </div>
          <div>
            <p className="font-heading text-4xl font-semibold leading-none tracking-tight text-stone-900">
              Roamly
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
