import { useRef, useSyncExternalStore } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { getProduct } from "@/data/products";
import { glowFromSwatch } from "@/lib/motion";
import { ButtonLink } from "@/components/common/Button";
import { cn } from "@/lib/utils";

interface Callout {
  value: string;
  label: string;
  /** Anchor on the shoe image, in % of the image box (so it stays on the shoe). */
  x: number;
  y: number;
  side: "left" | "right";
  at: number;
}

/** The pinned scroll track needs room: wide enough for callouts, tall enough for the stage. */
const PINNED_QUERY = "(min-width: 768px) and (min-height: 640px)";

function usePinnedLayout(): boolean {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const mq = window.matchMedia(PINNED_QUERY);
      mq.addEventListener?.("change", notify);
      return () => mq.removeEventListener?.("change", notify);
    },
    () => (typeof window.matchMedia === "function" ? window.matchMedia(PINNED_QUERY).matches : false),
    () => false,
  );
}

function CalloutMark({ c, progress }: { c: Callout; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [c.at, c.at + 0.08], [0, 1]);
  const draw = useTransform(progress, [c.at, c.at + 0.1], [0, 1]);
  const y = useTransform(progress, [c.at, c.at + 0.1], [12, 0]);
  return (
    <motion.div className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, opacity }}>
      <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-glow shadow-[0_0_18px_4px_hsl(var(--glow))]" />
      <svg className={`absolute top-0 h-px w-[min(12vw,150px)] overflow-visible ${c.side === "left" ? "right-0" : "left-0"}`} aria-hidden>
        <motion.line x1={c.side === "left" ? "100%" : 0} x2={c.side === "left" ? 0 : "100%"} y1="0" y2="0" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="1" style={{ pathLength: draw }} />
      </svg>
      <motion.div
        style={{ y }}
        className={`absolute top-3 w-max ${c.side === "left" ? "right-[min(12vw,150px)] text-right" : "left-[min(12vw,150px)]"}`}
      >
        <p className="tabular text-display text-[clamp(1.75rem,3.2vw,2.75rem)]">{c.value}</p>
        <p className="text-label mt-1 text-muted-foreground">{c.label}</p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Scroll-linked lab sequence: the Air Runner turns on its stage while its
 * real spec values draw in as annotated callouts. On small screens, short
 * viewports and under reduced motion it is a plain static layout in its
 * final state, so nothing is pinned or clipped.
 */
export default function LabStory() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const roomy = usePinnedLayout();
  const pinned = !reduce && roomy;
  const product = getProduct("air-runner")!;
  const colorway = product.colorways[0];
  const spec = (label: string) => product.specs.find((s) => s.label.startsWith(label))?.value ?? "";

  // Hooks stay unconditional: when not pinned, a resting value at 1 stands in for scroll progress.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const progress = pinned ? scrollYProgress : still;

  const rotate = useTransform(progress, [0, 1], [-18, -8]);
  const scale = useTransform(progress, [0, 0.35, 1], [0.9, 1, 1.04]);
  const shoeY = useTransform(progress, [0, 1], ["3%", "-2%"]);
  const titleOpacity = useTransform(progress, [0, 0.12], [0, 1]);

  // Anchors are measured on the trimmed render at its mid-scroll pose.
  const callouts: Callout[] = [
    { value: spec("Weight"), label: "Weight, US M9", x: 74, y: 22, side: "right", at: 0.22 },
    { value: spec("Heel stack"), label: "Responsive foam stack", x: 86, y: 52, side: "right", at: 0.42 },
    { value: spec("Heel-to-toe"), label: "Heel-to-toe drop", x: 22, y: 76, side: "left", at: 0.62 },
  ];

  return (
    <section
      ref={ref}
      className={cn("relative overflow-x-clip", pinned && "h-[260vh]")}
      aria-labelledby="lab-title"
      style={{ ["--glow" as string]: glowFromSwatch(colorway.swatch) }}
    >
      <div className={cn("relative flex min-h-[100svh] flex-col", pinned ? "sticky top-0" : "py-20 md:py-24")}>
        <div aria-hidden className="absolute inset-0 bg-grid" />
        <div aria-hidden className="glow-pool absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80" />

        <motion.div style={{ opacity: titleOpacity }} className={cn("container relative z-10 max-w-[1440px] text-center", pinned && "pt-24")}>
          <h2 id="lab-title" className="text-display mx-auto max-w-[16ch] text-[clamp(2.25rem,5vw,4.5rem)] lg:max-w-none">
            Engineered to disappear
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-muted-foreground">
            The {product.name} pairs a responsive full-length foam with a seamless mesh upper.{pinned ? " Scroll to look closer." : ""}
          </p>
        </motion.div>

        <div className="relative flex flex-1 items-center justify-center py-4">
          {/* Same box as the shoe, so the callouts stay anchored to it */}
          <div
            className={cn(
              "relative aspect-[744/684] max-md:w-[min(86vw,520px)]",
              pinned ? "w-[min(78vw,720px,calc((100svh-21rem)*1.088))]" : "w-[min(78vw,720px)]",
            )}
          >
            <motion.img
              src={colorway.image}
              alt={`${product.name} side profile`}
              width={744}
              height={684}
              loading="lazy"
              decoding="async"
              style={{ rotate, scale, y: shoeY }}
              className="h-full w-full object-contain drop-shadow-[0_60px_60px_rgba(0,0,0,0.7)]"
            />
            <div className="absolute inset-0 hidden md:block">
              {callouts.map((c) => (
                <CalloutMark key={c.label} c={c} progress={progress} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: the same specs as a simple row */}
        <dl className="container relative z-10 grid grid-cols-3 gap-3 pb-6 md:hidden">
          {callouts.map((c) => (
            <div key={c.label} className="rounded-2xl bg-surface/70 p-3 backdrop-blur">
              <dt className="text-label text-muted-foreground">{c.label}</dt>
              <dd className="tabular mt-1 text-lg font-semibold">{c.value}</dd>
            </div>
          ))}
        </dl>

        <div className={cn("container relative z-10 flex max-w-[1440px] justify-center", pinned ? "pb-10" : "pb-4")}>
          <ButtonLink to={`/products/${product.id}`} variant="outline">
            Explore the {product.name.replace(/^Hike /, "")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
