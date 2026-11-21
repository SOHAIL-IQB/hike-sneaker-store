import type { Transition, Variants } from "framer-motion";

/** One easing for the whole site: a long, soft exponential settle. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const spring: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };
export const softSpring: Transition = { type: "spring", stiffness: 120, damping: 22 };

/** Blur-to-sharp rise used for every section entrance. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

/** Viewport settings for whileInView entrances. */
export const inView = { once: true, margin: "0px 0px -12% 0px" } as const;

/** "#FF5A1F" → "16 100% 56%" so a colourway can drive the --glow token. */
export function hexToHslTriplet(hex: string): string {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.replace(/./g, "$&$&") : m, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  // Near-neutral colourways (white, black, grey) fall back to a cool steel glow
  // so the light never goes muddy.
  if (s < 0.12) return "215 30% 62%";
  return `${Math.round(h)} ${Math.round(Math.max(s, 0.55) * 100)}% ${Math.round(Math.min(Math.max(l, 0.45), 0.62) * 100)}%`;
}

/** The most saturated swatch of a colourway is the one that lights the stage. */
export function glowFromSwatch(swatch: [string, string]): string {
  const sat = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return Math.max(r, g, b) - Math.min(r, g, b);
  };
  return hexToHslTriplet(sat(swatch[0]) >= sat(swatch[1]) ? swatch[0] : swatch[1]);
}
