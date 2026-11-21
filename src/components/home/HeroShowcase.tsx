import { useMemo, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getProduct, isOnSale, type Product } from "@/data/products";
import { hasRealImage } from "@/data/images";
import { useShop } from "@/store/ShopProvider";
import { useUI } from "@/store/UIProvider";
import { trackEvent } from "@/lib/analytics";
import { EASE, glowFromSwatch } from "@/lib/motion";
import { Button } from "@/components/common/Button";
import Price from "@/components/product/Price";
import { cn } from "@/lib/utils";

/** Shoes the hero can feature, in order. Only those with a real photo are shown. */
const FEATURED_IDS = ["air-runner", "tempo-elite", "rim-runner", "flex-motion", "trailhead", "street-pro"];

const textItem = {
  hidden: { opacity: 0, y: 22, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 110, damping: 20 } },
  exit: { opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.2 } },
} as const;

/**
 * Home hero — adapted from the 21st.dev "Spatial Product Showcase": a product
 * floating inside an orbit ring, reactive ambient light that follows the active
 * item, and a floating dock to switch between items. Rebuilt around real
 * catalogue data with a working size picker and Add to bag.
 */
export default function HeroShowcase() {
  const featured = useMemo(() => {
    const withImages = FEATURED_IDS.map((id) => getProduct(id)!).filter((p) => p && hasRealImage(p.id, p.colorways[0].id));
    return withImages.length ? withImages.slice(0, 4) : [getProduct("air-runner")!];
  }, []);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const product = featured[index];
  const colorway = product.colorways.find((c) => hasRealImage(product.id, c.id)) ?? product.colorways[0];
  const glow = glowFromSwatch(colorway.swatch);
  const reduce = useReducedMotion();

  const select = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? 1 : -1);
    setIndex(i);
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
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-36 pt-28 md:pb-32"
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

      <div className="container relative grid max-w-[1440px] items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
        {/* Copy + buy box */}
        <div className="relative z-10 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
              <motion.p variants={textItem} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_12px_2px_hsl(var(--glow))]" />
                {product.tagline}
                {product.badges.includes("new") && <span className="text-signal">· Just dropped</span>}
              </motion.p>
              <motion.h1 variants={textItem} className="text-display mt-4 text-[clamp(2.75rem,7vw,6rem)]">
                {product.name.replace(/^Hike /, "")}
              </motion.h1>
              <motion.p variants={textItem} className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted-foreground md:text-lg">
                {product.description.split(". ")[0]}.
              </motion.p>
              <motion.div variants={textItem}>
                <BuyRow key={product.id} product={product} colorwayId={colorway.id} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stage */}
        <div className="relative order-1 mx-auto aspect-square w-full max-w-[min(88vw,46svh,640px)] lg:order-2 lg:max-w-[min(100%,68svh)]">
          <motion.div style={{ x: ringX, y: ringY }} className="absolute inset-[6%]" aria-hidden>
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
              className="absolute inset-[18%] rounded-full bg-glow blur-[90px]"
              style={{ opacity: 0.6 }}
            />
          </motion.div>

          <motion.div style={{ x: shoeX, y: shoeY, rotate: shoeRotate }} className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={reduce ? undefined : { y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[92%]"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={product.id + colorway.id}
                  src={colorway.image}
                  alt={`${product.name} in ${colorway.name}`}
                  custom={direction}
                  variants={{
                    initial: (d: number) => ({ opacity: 0, scale: 1.25, rotate: d * 24 - 14, x: d * 90, filter: "blur(16px)" }),
                    animate: { opacity: 1, scale: 1, rotate: -14, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 140, damping: 18 } },
                    exit: (d: number) => ({ opacity: 0, scale: 0.7, rotate: -d * 20 - 14, x: -d * 60, filter: "blur(18px)", transition: { duration: 0.28 } }),
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  draggable={false}
                  className="w-full select-none object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.7)]"
                />
              </AnimatePresence>
              {/* Floor shadow */}
              <div aria-hidden className="mx-auto -mt-4 h-6 w-2/3 rounded-[50%] bg-black/70 blur-xl" />
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
            role="tablist"
            aria-label="Featured sneakers"
          >
            {featured.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === index}
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
                  <img src={p.colorways[0].image} alt="" className="h-8 w-8 -rotate-12 object-contain" />
                </span>
                <span className={cn("relative whitespace-nowrap transition-colors", i === index ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {p.name.replace(/^Hike /, "")}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}

function BuyRow({ product, colorwayId }: { product: Product; colorwayId: string }) {
  const { addToBag } = useShop();
  const { openBag } = useUI();
  const colorway = product.colorways.find((c) => c.id === colorwayId)!;
  const available = product.sizes.filter((s) => !colorway.soldOut?.includes(s));
  const [size, setSize] = useState("");
  const [error, setError] = useState(false);

  const add = () => {
    if (!size) {
      setError(true);
      return;
    }
    addToBag(product.id, colorway.id, size);
    trackEvent("add_to_cart", { item_id: product.id, item_name: product.name, price: product.price, size });
    openBag({ productId: product.id, colorwayId: colorway.id, size });
  };

  return (
    <div className="mt-8">
      <div className="flex items-baseline gap-4">
        <Price product={product} className="text-2xl font-semibold" />
        {isOnSale(product) && <span className="text-sm text-signal">Sale</span>}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative">
          <span className="sr-only">Size</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? "hero-size-error" : undefined}
            className={cn(
              "tabular h-14 appearance-none rounded-full border bg-surface/70 pl-6 pr-12 font-semibold backdrop-blur-md transition-colors focus:outline-none focus-visible:border-signal",
              error ? "border-destructive" : "border-surface-3 hover:border-foreground/40",
            )}
          >
            <option value="">Select size (US)</option>
            {product.sizes.map((s) => (
              <option key={s} value={s} disabled={!available.includes(s)}>
                US {s}
                {!available.includes(s) ? " — sold out" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </label>
        <Button variant="signal" size="lg" onClick={add}>
          Add to bag
        </Button>
        <Link to={`/products/${product.id}`} className="group inline-flex h-14 items-center gap-2 px-3 font-semibold text-foreground/80 hover:text-foreground">
          Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      {error && (
        <p id="hero-size-error" role="alert" className="mt-3 text-sm text-destructive">
          Pick a size first.
        </p>
      )}
    </div>
  );
}
