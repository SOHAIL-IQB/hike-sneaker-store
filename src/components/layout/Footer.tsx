import { Link } from "react-router-dom";
import { ArrowUpRight, Github } from "lucide-react";
import { HikeMark } from "@/components/brand/Logo";
import { CATEGORIES } from "@/data/products";

const col = "space-y-3 text-sm";
const link = "text-foreground/70 transition-colors hover:text-foreground";

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="container relative max-w-[1440px] pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <HikeMark className="h-8 text-signal" />
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
              Hike is a demo sneaker storefront — a portfolio project with a real shopping flow, no backend and
              Google Analytics 4 tracking on every step.
            </p>
          </div>
          <div className={col}>
            <p className="text-label text-muted-foreground">Shop</p>
            <ul className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link to={`/products?category=${c.id}`} className={link}>
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products?sale=1" className={link}>
                  Sale
                </Link>
              </li>
            </ul>
          </div>
          <div className={col}>
            <p className="text-label text-muted-foreground">You</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/favorites" className={link}>
                  Favourites
                </Link>
              </li>
              <li>
                <Link to="/cart" className={link}>
                  Bag
                </Link>
              </li>
              <li>
                <Link to="/products?sort=newest" className={link}>
                  New arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div className={col}>
            <p className="text-label text-muted-foreground">Project</p>
            <ul className="space-y-2.5">
              <li>
                <a href="https://github.com/SOHAIL-IQB/hike-sneaker-store" target="_blank" rel="noopener noreferrer" className={`${link} inline-flex items-center gap-1.5`}>
                  <Github className="h-4 w-4" strokeWidth={1.75} /> Source on GitHub <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden
          className="text-display pointer-events-none mt-20 select-none text-center text-[clamp(5rem,24vw,22rem)] leading-[0.8] text-transparent [-webkit-text-stroke:1px_hsl(var(--surface-3))]"
        >
          Hike
        </p>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Hike. Demo store — no real orders or payments.</p>
          <p>Prices, stock and specs are illustrative.</p>
        </div>
      </div>
    </footer>
  );
}
