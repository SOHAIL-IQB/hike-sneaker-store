import { cn } from "@/lib/utils";

/**
 * Hike's own mark: a forward-leaning double summit with a trail cut through it.
 * Drawn to stay clear of any other sportswear mark — no curves, no stripes, no animal.
 */
export const HikeMark = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    viewBox="0 0 44 28"
    className={cn("h-6 w-auto", className)}
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    fill="currentColor"
  >
    <path d="M2 28 16.6 1h3.3l6.2 11.2L29.9 6h3.3L42 28H2Zm4.4-1.2h4.9L36.2 15l-1.7-3.1L6.4 26.8Z" fillRule="evenodd" />
  </svg>
);

const Logo = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
    <HikeMark />
    <span className="text-2xl font-black uppercase leading-none tracking-[-0.01em] stretch-condensed">Hike</span>
  </span>
);

export default Logo;
