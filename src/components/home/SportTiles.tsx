import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, products, sortProducts } from "@/data/products";
import { hasRealImage } from "@/data/images";
import { glowFromSwatch, inView, rise, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const lead = (category: string) => {
  const list = sortProducts(products.filter((p) => p.category === category), "featured");
  return list.find((p) => hasRealImage(p.id, p.colorways[0].id)) ?? list[0];
};

/** Bento of the four sports; each tile is lit by its lead shoe's colourway. */
export default function SportTiles() {
  return (
    <section className="container max-w-[1440px]" aria-labelledby="sports-title">
      <motion.h2 id="sports-title" variants={rise} initial="hidden" whileInView="show" viewport={inView} className="text-display mb-8 text-[clamp(2rem,4.5vw,3.5rem)]">
        Shop by sport
      </motion.h2>
      <motion.ul
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="grid gap-4 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(16rem,1fr))]"
      >
        {CATEGORIES.map((c, i) => {
          const p = lead(c.id);
          const glow = glowFromSwatch(p.colorways[0].swatch);
          const count = products.filter((x) => x.category === c.id).length;
          return (
            <motion.li
              key={c.id}
              variants={rise}
              className={cn(i === 0 ? "md:col-span-4 md:row-span-1" : i === 1 ? "md:col-span-2" : i === 2 ? "md:col-span-3" : "md:col-span-3")}
            >
              <Link
                to={`/products?category=${c.id}`}
                className="group relative flex h-full min-h-[16rem] overflow-hidden rounded-[28px] border border-white/[0.06] bg-surface p-6 edge-light md:p-8"
                style={{ ["--glow" as string]: glow }}
              >
                <div className="pointer-events-none absolute -right-[10%] top-1/2 h-[120%] w-[70%] -translate-y-1/2 rounded-full bg-glow opacity-20 blur-[80px] transition-opacity duration-700 group-hover:opacity-40" />
                <div className="relative z-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-display text-[clamp(1.75rem,3.2vw,3rem)]">{c.label}</h3>
                    <p className="mt-2 max-w-[22ch] text-sm text-muted-foreground">{c.blurb}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
                    {count} styles
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] transition-[background-color,transform] duration-500 group-hover:rotate-45 group-hover:bg-signal group-hover:text-signal-foreground">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </div>
                <img
                  src={p.colorways[0].image}
                  alt=""
                  loading="lazy"
                  className="pointer-events-none absolute -bottom-[6%] -right-[4%] w-[62%] max-w-[420px] -rotate-[14deg] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] transition-transform duration-[900ms] ease-out group-hover:-translate-y-4 group-hover:-rotate-[20deg] group-hover:scale-105"
                />
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
