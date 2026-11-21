import { HikeMark } from "@/components/brand/Logo";

const WORDS = ["Running", "Lifestyle", "Training", "Basketball", "Free delivery over $100", "30-day returns"];

/** Endless ticker. Pure CSS so it costs nothing; stops for reduced-motion users. */
export default function Marquee() {
  const row = (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden>
      {WORDS.map((w) => (
        <li key={w} className="flex items-center gap-10">
          <span className="text-display whitespace-nowrap text-[clamp(1.5rem,3vw,2.5rem)] text-foreground/90">{w}</span>
          <HikeMark className="h-5 text-signal" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden border-y border-border bg-surface/40 py-6">
      <p className="sr-only">{WORDS.join(", ")}</p>
      <div className="flex w-max animate-[marquee_38s_linear_infinite] motion-reduce:animate-none">
        {row}
        {row}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
