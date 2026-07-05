"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Sticker = {
  src: string;
  alt: string;
  size: number;
  widthClass: string;
  float: { y: number; rotate: number; duration: number; delay: number };
  baseRotate: number;
};

const LEFT_STICKERS: Sticker[] = [
  {
    src: "/travel-mountain.png",
    alt: "Mountain",
    size: 100,
    widthClass: "w-[4.5rem] lg:w-[5.5rem]",
    baseRotate: -6,
    float: { y: 8, rotate: 3, duration: 5, delay: 1.2 },
  },
  {
    src: "/travel-suitcase.png",
    alt: "Suitcase",
    size: 110,
    widthClass: "w-[4.25rem] lg:w-[5.25rem]",
    baseRotate: 8,
    float: { y: 9, rotate: 4, duration: 5.2, delay: 1 },
  },
  {
    src: "/travel-beach.png",
    alt: "Beach",
    size: 120,
    widthClass: "w-[4.75rem] lg:w-[6rem]",
    baseRotate: -10,
    float: { y: 10, rotate: 4, duration: 6, delay: 0.8 },
  },
];

const RIGHT_STICKERS: Sticker[] = [
  {
    src: "/travel-airplane.png",
    alt: "Airplane",
    size: 140,
    widthClass: "w-[5rem] lg:w-[6.5rem]",
    baseRotate: -14,
    float: { y: 12, rotate: 5, duration: 5.5, delay: 0 },
  },
  {
    src: "/travel-heart.png",
    alt: "Heart",
    size: 128,
    widthClass: "w-[4.5rem] lg:w-[5rem]",
    baseRotate: 12,
    float: { y: 6, rotate: 8, duration: 4, delay: 0.4 },
  },
  {
    src: "/travel-stamp.png",
    alt: "Travel stamp",
    size: 114,
    widthClass: "w-[4.55rem] lg:w-[5.525rem]",
    baseRotate: 16,
    float: { y: 7, rotate: 6, duration: 4.5, delay: 0.6 },
  },
];

function StickerImage({
  sticker,
  widthClass,
}: {
  sticker: Sticker;
  widthClass?: string;
}) {
  const { y, rotate, duration, delay } = sticker.float;

  return (
    <motion.div
      className={`pointer-events-none shrink-0 ${widthClass ?? sticker.widthClass}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -y, 0],
        rotate: [
          sticker.baseRotate,
          sticker.baseRotate + rotate,
          sticker.baseRotate,
        ],
      }}
      transition={{
        opacity: { duration: 0.8, delay: delay + 0.2 },
        scale: { duration: 0.8, delay: delay + 0.2 },
        y: {
          duration,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: duration * 1.1,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <Image
        src={sticker.src}
        alt={sticker.alt}
        width={sticker.size}
        height={sticker.size}
        className="h-auto w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        priority
      />
    </motion.div>
  );
}

function StickerColumn({ stickers }: { stickers: Sticker[] }) {
  return (
    <div
      className="hidden w-16 shrink-0 flex-col items-center justify-center gap-10 py-4 sm:flex lg:w-24 lg:gap-14"
      aria-hidden
    >
      {stickers.map((sticker) => (
        <StickerImage key={sticker.src} sticker={sticker} />
      ))}
    </div>
  );
}

const MOBILE_STICKERS: Array<{ sticker: Sticker; widthClass: string }> = [
  { sticker: RIGHT_STICKERS[0], widthClass: "w-11" },
  { sticker: RIGHT_STICKERS[1], widthClass: "w-14" },
  { sticker: LEFT_STICKERS[0], widthClass: "w-10" },
  { sticker: LEFT_STICKERS[1], widthClass: "w-10" },
  { sticker: RIGHT_STICKERS[2], widthClass: "w-[2.6rem]" },
  { sticker: LEFT_STICKERS[2], widthClass: "w-11" },
];

export function LandingDecorationsMobile() {
  return (
    <div
      className="flex items-end justify-center gap-4 pb-2 sm:hidden"
      aria-hidden
    >
      {MOBILE_STICKERS.map(({ sticker, widthClass }) => (
        <StickerImage
          key={sticker.src}
          sticker={sticker}
          widthClass={widthClass}
        />
      ))}
    </div>
  );
}

export function LandingDecorationsLeft() {
  return <StickerColumn stickers={LEFT_STICKERS} />;
}

export function LandingDecorationsRight() {
  return <StickerColumn stickers={RIGHT_STICKERS} />;
}
