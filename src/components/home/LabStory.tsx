import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { getProduct } from "@/data/products";
import { glowFromSwatch } from "@/lib/motion";
import { ButtonLink } from "@/components/common/Button";

interface Callout {
  value: string;
  label: string;
  /** Anchor position on the stage, in %. */
  x: number;
  y: number;
  side: "left" | "right";
  at: number;
}

function CalloutMark({ c, progress }: { c: Callout; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [c.at, c.at + 0.08], [0, 1]);
  const draw = useTransform(progress, [c.at, c.at + 0.1], [0, 1]);
  const y = useTransform(progress, [c.at, c.at + 0.1], [12, 0]);
  return (
    <motion.div className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, opacity }}>
      <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-glow shadow-[0_0_18px_4px_hsl(var(--glow))]" />
      <svg className={`absolute top-0 h-px w-[min(16vw,180px)] overflow-visible ${c.side === "left" ? "right-0" : "left-0"}`} aria-hidden>
        <motion.line x1={c.side === "left" ? "100%" : 0} x2={c.side === "left" ? 0 : "100%"} y1="0" y2="0" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="1" style={{ pathLength: draw }} />
      </svg>
      <motion.div
        style={{ y }}
        className={`absolute top-3 w-max ${c.side === "left" ? "right-[min(16vw,180px)] text-right" : "left-[min(16vw,180px)]"}`}
      >
        <p className="tabular text-display text-[clamp(1.75rem,3.4vw,3rem)]">{c.value}</p>
        <p className="text-label mt-1 text-muted-foreground">{c.label}</p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Scroll-linked lab sequence: the Air Runner turns on its stage while its
 * real spec values draw in as annotated callouts.
 */
export default function LabStory() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const product = getProduct("air-runner")!;
  const colorway = product.colorways[0];
  const spec = (label: string) => product.specs.find((s) => s.label.startsWith(label))?.value ?? "";
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [-12, -12] : [-32, 8]);
  const scale = useTransform(scrollYProgress, [0, 0.35, 1], reduce ? [1, 1, 1] : [0.72, 1, 1.08]);
  const shoeY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["8%", "-4%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0.3]);
  const progress = reduce ? ({ get: () => 1 } as unknown as MotionValue<number>) : scrollYProgress;

  const callouts: Callout[] = [
    { value: spec("Weight"), label: "Weight, US M9", x: 30, y: 30, side: "left", at: 0.22 },
    { value: spec("Heel stack"), label: "Responsive foam stack", x: 70, y: 40, side: "right", at: 0.42 },
    { value: spec("Heel-to-toe"), label: "Heel-to-toe drop", x: 34, y: 70, side: "left", at: 0.62 },
  ];

  return (
    <section ref={ref} className="relative h-[260vh]" aria-labelledby="lab-title" style={{ ["--glow" as string]: glowFromSwatch(colorway.swatch) }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid" />
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow opacity-25 blur-[120px]" />

        <motion.div style={{ opacity: titleOpacity }} className="container relative z-10 max-w-[1440px] pt-28 text-center">
          <h2 id="lab-title" className="text-display mx-auto max-w-[16ch] text-[clamp(2.25rem,6vw,5.5rem)]">
            Engineered to disappear
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-muted-foreground">
            The {product.name} pairs a responsive full-length foam with a seamless mesh upper. Scroll to look closer.
          </p>
        </motion.div>

        <div className="relative mx-auto w-full max-w-[1100px] flex-1">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src={colorway.image}
              alt={`${product.name} side profile`}
              loading="lazy"
              style={{ rotate, scale, y: shoeY }}
              className="w-[min(78vw,720px)] object-contain drop-shadow-[0_60px_60px_rgba(0,0,0,0.7)]"
            />
          </div>
          <div className="absolute inset-0 hidden md:block">
            {callouts.map((c) => (
              <CalloutMark key={c.label} c={c} progress={progress} />
            ))}
          </div>
        </div>

        {/* Mobile: the same specs as a simple row */}
        <dl className="container relative z-10 grid grid-cols-3 gap-3 pb-10 md:hidden">
          {callouts.map((c) => (
            <div key={c.label} className="rounded-2xl bg-surface/70 p-3 backdrop-blur">
              <dt className="text-label text-muted-foreground">{c.label}</dt>
              <dd className="tabular mt-1 text-lg font-semibold">{c.value}</dd>
            </div>
          ))}
        </dl>

        <div className="container relative z-10 hidden max-w-[1440px] justify-center pb-12 md:flex">
          <ButtonLink to={`/products/${product.id}`} variant="outline">
            Explore the {product.name.replace(/^Hike /, "")}
          </ButtonLink>
        </div>
        <Link to={`/products/${product.id}`} className="sr-only">
          Explore the {product.name}
        </Link>
      </div>
    </section>
  );
}
