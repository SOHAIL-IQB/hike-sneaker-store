import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";
import { inView, rise } from "@/lib/motion";
import ProductCard from "./ProductCard";

/** Horizontal, snap-scrolling product rail with arrow controls. */
export default function ProductRail({ title, products, action }: { title: string; products: Product[]; action?: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const arrow =
    "grid h-11 w-11 place-items-center rounded-full border border-surface-3 text-foreground/80 transition-colors hover:border-foreground/50 hover:text-foreground";

  return (
    <motion.section variants={rise} initial="hidden" whileInView="show" viewport={inView} aria-label={title}>
      <div className="container mb-8 flex max-w-[1440px] items-end justify-between gap-4">
        <h2 className="text-display text-[clamp(2rem,4.5vw,3.5rem)]">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <button type="button" className={`${arrow} hidden md:grid`} onClick={() => scroll(-1)} aria-label="Scroll left">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" className={`${arrow} hidden md:grid`} onClick={() => scroll(1)} aria-label="Scroll right">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 md:gap-5 md:px-8 lg:px-[max(3rem,calc((100vw_-_1440px)/2_+_3rem))]"
        data-lenis-prevent-wheel
      >
        {products.map((p) => (
          <li key={p.id} className="w-[72vw] shrink-0 snap-start sm:w-[44vw] md:w-[31vw] lg:w-[23vw] xl:w-[19rem]">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
