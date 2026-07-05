import type { Transition } from "framer-motion";

/** Shared motion timing — keep transitions slow and smooth across the app. */
export const motionTransition = {
  page: {
    duration: 1.1,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,
  backdrop: {
    duration: 2,
    ease: "easeInOut",
  } satisfies Transition,
  message: {
    duration: 0.85,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,
  interactive: {
    duration: 0.65,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,
} as const;

export const motionPage = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: motionTransition.page,
} as const;
