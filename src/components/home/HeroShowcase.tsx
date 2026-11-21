import { useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getProduct, isOnSale, type Product } from "@/data/products";
import { hasRealImage } from "@/data/images";
import { useShop } from "@/store/ShopProvider";
import { useUI } from "@/store/UIProvider";
import { trackAddToCart } from "@/lib/analytics";
import { EASE, glowFromSwatch } from "@/lib/motion";
import { Button } from "@/components/common/Button";
import Price from "@/components/product/Price";
import { cn } from "@/lib/utils";

/**
 * Shoes the hero can feature, in order. Each pair names the colourway it opens
 * on, chosen so every shoe lights the stage a different colour.
 */
const FEATURED_PAIRS = [
  { id: "air-runner", colorwayId: "black-ember" }, // ember
  { id: "tempo-elite", colorwayId: "electric-blue" }, // blue
  { id: "velocity", colorwayId: "volt" }, // volt
  { id: "glide-max", colorwayId: "lilac" }, // lilac
] as const;

/** Intrinsic size of the trimmed running-shoe renders (all featured shoes share it). */
const IMG_W = 744;
const IMG_H = 684;

const textItem = {
  hidden: { opacity: 0, y: 22, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 110, damping: 20 } },
  exit: { opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.2 } },
} as const;

/** `fetchpriority` is not in React 18's DOM typings; pass it through as a plain attribute. */
const highPriority = { fetchpriority: "high" } as Record<string, string>;

/**
 * Home hero — adapted from the 21st.dev "Spatial Product Showcase": a product
 * floating inside an orbit ring, reactive ambient light that follows the active
 * item, and a floating dock to switch between items. Rebuilt around real
 * catalogue data with a colourway control, a size picker and Add to bag.
 */
export default function HeroShowcase() {
  const featured = useMemo(() => {
    const items = FEATURED_PAIRS.flatMap((f) => {
      const product = getProduct(f.id);
      const colorway = product?.colorways.find((c) => c.id === f.colorwayId);
      return product && colorway && hasRealImage(product.id, colorway.id) ? [{ product, colorway }] : [];
    });
    if (items.length) return items;
    const product = getProduct("air-runner")!;
    return [{ product, colorway: product.colorways[0] }];
  }, []);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [colorwayId, setColorwayId] = useState(featured[0].colorway.id);
  const { product } = featured[index];
  const colorway = product.colorways.find((c) => c.id === colorwayId) ?? featured[index].colorway;
  const glow = glowFromSwatch(colorway.swatch);
  const reduce = useReducedMotion();

  const select = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? 1 : -1);
    setIndex(i);
    setColorwayId(featured[i].colorway.id);
  };

  // Pointer parallax on the stage.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  const shoeX = useTransform(sx, (v) => v * 28);
  const shoeY = useTransform(sy, (v) => v * 18);
  const shoeRotate = useTransform(sx, (v) => v * 4);
  const ringX = useTransform(sx, (v) => v * -12);
  const ringY = useTransform(sy, (v) => v * -10);
  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <section
      onMouseMove={onMove}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-36 pt-28 md:pb-32 lg:pb-24 lg:pt-24"
      aria-label="Featured sneaker"
      style={{ ["--glow" as string]: glow }}
    >
      {/* Ambient stage light that re-tints with the colourway */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        animate={{
          background: `radial-gradient(60% 70% at ${direction > 0 ? "72%" : "68%"} 45%, hsl(${glow} / 0.30), transparent 70%), radial-gradient(40% 40% at 15% 85%, hsl(${glow} / 0.10), transparent 70%)`,
        }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid" />

      <div className="container relative grid max-w-[1440px] items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
        {/* Copy + buy box */}
        <div className="relative z-10 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
              <motion.h1 variants={textItem} className="text-display text-[clamp(2.75rem,7vw,6rem)]">
                {product.name.replace(/^Hike /, "")}
              </motion.h1>
              <motion.p variants={textItem} className="mt-4 text-base text-muted-foreground md:text-lg">
                {product.tagline}
                {product.badges.includes("new") && <span className="text-signal"> · Just dropped</span>}
              </motion.p>
              <motion.p variants={textItem} className="mt-3 max-w-[46ch] text-base leading-relaxed text-muted-foreground">
                {product.description.split(". ")[0]}.
              </motion.p>
              <motion.div variants={textItem}>
                <BuyRow key={product.id} product={product} colorwayId={colorway.id} onColorway={setColorwayId} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stage */}
        <div className="relative order-1 mx-auto aspect-[744/684] w-full max-w-[min(88vw,52svh,640px)] lg:order-2 lg:max-w-none lg:w-[min(58vw,max(calc(1.088*(100svh-12rem)),44vw))]">
          <div aria-hidden className="absolute inset-0 flex items-center justify-center">
            <motion.div style={{ x: ringX, y: ringY }} className="relative aspect-square h-[96%]">
              <motion.div
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-white/[0.12]"
              />
              <motion.div
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[11%] rounded-full border border-white/[0.06]"
              >
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-glow shadow-[0_0_16px_4px_hsl(var(--glow))]" />
              </motion.div>
              <motion.div
                animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.55, 0.8, 0.55] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glow-pool absolute inset-[6%] rounded-full"
                style={{ opacity: 0.7 }}
              />
            </motion.div>
          </div>

          <motion.div style={{ x: shoeX, y: shoeY, rotate: shoeRotate }} className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={reduce ? undefined : { y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[95%]"
            >
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.img
                  key={product.id + colorway.id}
                  src={colorway.image}
                  alt={`${product.name} in ${colorway.name}`}
                  width={IMG_W}
                  height={IMG_H}
                  decoding="async"
                  {...highPriority}
                  custom={direction}
                  variants={{
                    initial: (d: number) => ({ opacity: 0, scale: 1.25, rotate: d * 24 - 14, x: d * 90, filter: "blur(16px)" }),
                    animate: { opacity: 1, scale: 1, rotate: -8, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
                    exit: (d: number) => ({ opacity: 0, scale: 0.7, rotate: -d * 20 - 14, x: -d * 60, filter: "blur(18px)", transition: { duration: 0.28 } }),
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  draggable={false}
                  className="h-auto w-full select-none object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.7)]"
                />
              </AnimatePresence>
              {/* Floor shadow */}
              <div aria-hidden className="mx-auto -mt-2 h-6 w-2/3 rounded-[50%] bg-black/70 blur-xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating dock */}
      {featured.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-4 md:bottom-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[hsl(222_14%_7%/0.7)] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl no-scrollbar"
            role="group"
            aria-label="Featured sneakers"
          >
            {featured.map(({ product: p, colorway: c }, i) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={i === index}
                onClick={() => select(i)}
                className="relative flex h-12 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-4 text-sm font-medium"
              >
                {i === index && (
                  <motion.span
                    layoutId="hero-dock"
                    className="absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-inset ring-white/10"
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  />
                )}
                <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-surface-2">
                  <img
                    src={c.image}
                    alt=""
                    width={32}
                    height={29}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-8 -rotate-12 object-contain"
                  />
                </span>
                <span className={cn("relative whitespace-nowrap transition-colors", i === index ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {p.name.replace(/^Hike /, "")}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        Showing {product.name}, {colorway.name}
      </p>
    </section>
  );
}

function BuyRow({ product, colorwayId, onColorway }: { product: Product; colorwayId: string; onColorway: (id: string) => void }) {
  const { addToBag } = useShop();
  const { openBag } = useUI();
  const colorway = product.colorways.find((c) => c.id === colorwayId) ?? product.colorways[0];
  const isAvailable = (s: string) => !colorway.soldOut?.includes(s);
  const [picked, setPicked] = useState("");
  // A size that is sold out in the chosen colourway is treated as not picked.
  const size = picked && isAvailable(picked) ? picked : "";
  const [error, setError] = useState(false);
  const [limit, setLimit] = useState(false);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (s: string) => {
    setPicked(s);
    setError(false);
    setLimit(false);
  };

  const add = () => {
    if (!size) {
      setError(true);
      return;
    }
    const added = addToBag(product.id, colorway.id, size);
    if (!added) {
      setLimit(true);
      return;
    }
    setLimit(false);
    trackAddToCart(product, size);
    openBag({ productId: product.id, colorwayId: colorway.id, size });
  };

  const onSizeKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const from = Math.max(0, product.sizes.indexOf(size));
    for (let n = 1; n <= product.sizes.length; n++) {
      const i = (from + step * n + product.sizes.length * n) % product.sizes.length;
      const s = product.sizes[i];
      if (isAvailable(s)) {
        choose(s);
        radios.current[i]?.focus();
        return;
      }
    }
  };

  const firstAvailable = product.sizes.find(isAvailable);

  return (
    <div className="mt-7">
      <div className="flex items-baseline gap-4">
        <Price product={product} className="text-2xl font-semibold" />
        {isOnSale(product) && <span className="text-sm text-signal">Sale</span>}
      </div>

      {product.colorways.length > 1 && (
        <div className="mt-4 flex items-center gap-1" role="group" aria-label="Colourway">
          {product.colorways.map((c) => {
            const on = c.id === colorway.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                aria-label={c.name}
                onClick={() => onColorway(c.id)}
                className="grid h-8 w-8 place-items-center rounded-full"
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full ring-1 transition-[box-shadow,transform] duration-300",
                    on ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : "ring-control",
                  )}
                  style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }}
                />
              </button>
            );
          })}
          <span className="ml-2 text-sm text-muted-foreground">{colorway.name}</span>
        </div>
      )}

      <div role="radiogroup" aria-label="Size" aria-describedby={error ? "hero-size-error" : undefined} onKeyDown={onSizeKey} className="mt-4 flex flex-wrap gap-2">
        {product.sizes.map((s, i) => {
          const ok = isAvailable(s);
          const on = size === s;
          return (
            <button
              key={s}
              ref={(el) => (radios.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={ok ? `US ${s}` : `US ${s}, sold out`}
              disabled={!ok}
              tabIndex={on || (!size && s === firstAvailable) ? 0 : -1}
              onClick={() => choose(s)}
              className={cn(
                "tabular min-h-11 min-w-[3.25rem] rounded-xl border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:text-muted-foreground disabled:line-through disabled:opacity-50",
                on ? "border-foreground bg-foreground text-background" : error ? "border-destructive hover:bg-surface-2" : "border-control hover:border-foreground/60 hover:bg-surface-2",
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      {error && (
        <p id="hero-size-error" role="alert" className="mt-3 text-sm text-destructive">
          Pick a size first.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="signal" size="lg" onClick={add}>
          Add to bag
        </Button>
        <Link to={`/products/${product.id}?color=${colorway.id}`} className="group inline-flex h-14 items-center gap-2 px-3 font-semibold text-foreground/80 hover:text-foreground">
          Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <p role="status" className={cn("text-sm text-muted-foreground", limit && "mt-3")}>
        {limit ? "You already have the maximum of 10 in this size." : ""}
      </p>
    </div>
  );
}
