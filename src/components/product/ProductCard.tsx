import { memo, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { Product } from "@/data/products";
import { glowFromSwatch } from "@/lib/motion";
import { cn } from "@/lib/utils";
import FavoriteButton from "./FavoriteButton";
import Price, { discountPercent } from "./Price";

const BADGE_LABEL = { new: "New", bestseller: "Bestseller", sale: "Sale" } as const;

/**
 * Product tile adapted from the 21st.dev "Product Card" (3D tilt + cursor glow):
 * the card tilts toward the pointer, a glow in the colourway's own colour
 * follows it, and the shoe floats forward on its own depth layer.
 */
function ProductCard({ product, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const [active, setActive] = useState(0);
  const colorway = product.colorways[active];
  const glow = glowFromSwatch(colorway.swatch);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const hovering = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 220, damping: 22 });
  const glowOpacity = useSpring(hovering, { stiffness: 200, damping: 30 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, hsl(${glow} / 0.38), transparent 65%)`;

  // Tilt and pointer glow only make sense with a real hovering pointer; touch and reduced motion skip them.
  const reduce = useReducedMotion();
  const finePointer = useRef<boolean | null>(null);
  const canTilt = () => {
    if (reduce) return false;
    if (finePointer.current === null) {
      finePointer.current = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    }
    return finePointer.current;
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!canTilt()) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onEnter = () => {
    if (canTilt()) hovering.set(1);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    hovering.set(0);
  };

  const badge = product.badges[0];

  return (
    <article className={cn("group/card relative", className)} style={{ perspective: 1100 }}>
      <motion.div
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/[0.06] bg-surface edge-light"
      >
        {/* Engineering grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/0.04)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_50%,#000_40%,transparent_100%)]" />
        {/* Resting light under the shoe, in the colourway's colour */}
        <div
          className="pointer-events-none absolute inset-x-[12%] top-[22%] h-[56%] rounded-full opacity-60 transition-opacity duration-700 group-hover/card:opacity-90"
          style={{ background: `radial-gradient(closest-side, hsl(${glow} / 0.45), transparent)` }}
        />
        {/* Pointer-tracking glow */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glowBg, opacity: glowOpacity }} />

        <Link
          to={`/products/${product.id}${active ? `?color=${colorway.id}` : ""}`}
          className="absolute inset-0 z-10 rounded-[28px]"
          aria-label={`${product.name}, ${colorway.name}`}
        >
          <div className="absolute inset-0 flex items-center justify-center p-[10%]" style={{ transform: "translateZ(60px)" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={colorway.id}
                src={colorway.image}
                alt=""
                loading={priority ? "eager" : "lazy"}
                draggable={false}
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.65)] transition-transform duration-700 ease-out group-hover/card:-translate-y-3 group-hover/card:scale-[1.06] group-hover/card:-rotate-3"
              />
            </AnimatePresence>
          </div>
        </Link>

        {badge && (
          <span
            className={cn(
              "text-label pointer-events-none absolute left-4 top-4 z-20 rounded-full px-3 py-1.5",
              badge === "sale" ? "bg-signal text-signal-foreground" : "bg-white/[0.08] text-foreground backdrop-blur-md",
            )}
          >
            {badge === "sale" ? `−${discountPercent(product)}%` : BADGE_LABEL[badge]}
          </span>
        )}
        <FavoriteButton productId={product.id} name={product.name} className="absolute right-3 top-3 z-20" />

        {product.colorways.length > 1 && (
          <div className="absolute bottom-3 left-3 z-20 flex gap-1" role="group" aria-label="Colourways">
            {product.colorways.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-label={c.name}
                aria-pressed={i === active}
                className={cn(
                  "group/sw grid h-6 w-6 place-items-center rounded-full",
                )}
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full ring-1 ring-offset-1 ring-offset-surface transition-[box-shadow,transform] duration-300 group-hover/sw:scale-110",
                    i === active ? "ring-foreground" : "ring-control",
                  )}
                  style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <Link to={`/products/${product.id}`} className="mt-4 block px-1" tabIndex={-1}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          <Price product={product} className="shrink-0 font-semibold" />
        </div>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {product.tagline} · {product.gender === "unisex" ? "Unisex" : product.gender === "kids" ? "Kids" : product.gender === "men" ? "Men's" : "Women's"}
        </p>
      </Link>
    </article>
  );
}

export default memo(ProductCard);
