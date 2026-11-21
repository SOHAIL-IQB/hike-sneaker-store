import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Ruler, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/common/Button";
import Overlay from "@/components/common/Overlay";
import FavoriteButton from "@/components/product/FavoriteButton";
import Price, { discountPercent } from "@/components/product/Price";
import ProductRail from "@/components/product/ProductRail";
import { FREE_SHIPPING_FROM, getColorway, getProduct, isOnSale, relatedProducts, type Product } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { useUI } from "@/store/UIProvider";
import { trackEvent } from "@/lib/analytics";
import { EASE, glowFromSwatch } from "@/lib/motion";
import { cn } from "@/lib/utils";
import NotFound from "./NotFound";

const SIZE_CHART = [
  ["6", "5.5", "38.5", "24"],
  ["7", "6", "40", "25"],
  ["8", "7", "41", "26"],
  ["9", "8", "42.5", "27"],
  ["10", "9", "44", "28"],
  ["11", "10", "45", "29"],
  ["12", "11", "46", "30"],
  ["13", "12", "47.5", "31"],
];

const genderLabel = (p: Product) => (p.gender === "unisex" ? "Unisex" : p.gender === "kids" ? "Kids" : p.gender === "men" ? "Men's" : "Women's");

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProduct(id);
  return product ? <ProductView key={product.id} product={product} /> : <NotFound />;
}

function ProductView({ product }: { product: Product }) {
  const [params, setParams] = useSearchParams();
  const colorway = getColorway(product, params.get("color"));
  const glow = glowFromSwatch(colorway.swatch);
  const { addToBag, recordView, recent } = useShop();
  const { openBag } = useUI();
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // GA4: same event and parameters as the first version of the store.
  useEffect(() => {
    trackEvent("view_product", { item_id: product.id, item_name: product.name, price: product.price });
    recordView(product.id);
    document.title = `${product.name} — ${product.tagline} | Hike`;
    return () => {
      document.title = "Hike — Running, Lifestyle, Training & Basketball Sneakers";
    };
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (size && colorway.soldOut?.includes(size)) setSize(null);
  }, [colorway.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickColor = (cid: string) => {
    const next = new URLSearchParams(params);
    if (cid === product.colorways[0].id) next.delete("color");
    else next.set("color", cid);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const add = () => {
    if (!size) {
      setSizeError(true);
      document.getElementById("size-grid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addToBag(product.id, colorway.id, size);
    trackEvent("add_to_cart", { item_id: product.id, item_name: product.name, price: product.price, size });
    openBag({ productId: product.id, colorwayId: colorway.id, size });
  };

  // Stage drifts slightly as the page scrolls.
  const { scrollY } = useScroll();
  const stageY = useTransform(scrollY, [0, 800], [0, 60]);
  const stageRotate = useTransform(scrollY, [0, 800], [-12, -4]);

  const recentlyViewed = recent.filter((r) => r !== product.id).map((r) => getProduct(r)).filter((p): p is Product => !!p);

  return (
    <main id="main" style={{ ["--glow" as string]: glow }}>
      <div className="container max-w-[1440px] pt-24 md:pt-32">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/products" className="hover:text-foreground">
                Sneakers
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to={`/products?category=${product.category}`} className="capitalize hover:text-foreground">
                {product.category}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
          {/* Stage */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-[36px] border border-white/[0.06] bg-surface edge-light">
              <div aria-hidden className="absolute inset-0 bg-grid" />
              <motion.div
                aria-hidden
                className="absolute inset-0"
                animate={{ background: `radial-gradient(55% 55% at 50% 50%, hsl(${glow} / 0.38), transparent 72%)` }}
                transition={{ duration: 1, ease: EASE }}
              />
              <motion.div aria-hidden animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute inset-[9%] rounded-full border border-dashed border-white/[0.1]" />
              <motion.div style={{ y: stageY, rotate: stageRotate }} className="absolute inset-0 flex items-center justify-center p-[8%]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={colorway.id}
                    src={colorway.image}
                    alt={`${product.name} in ${colorway.name}`}
                    initial={{ opacity: 0, scale: 1.15, x: 40, filter: "blur(14px)" }}
                    animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 140, damping: 18 } }}
                    exit={{ opacity: 0, scale: 0.85, x: -40, filter: "blur(14px)", transition: { duration: 0.25 } }}
                    className="w-full object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.7)]"
                    draggable={false}
                  />
                </AnimatePresence>
              </motion.div>
              {isOnSale(product) && (
                <span className="text-label absolute left-5 top-5 rounded-full bg-signal px-3 py-1.5 text-signal-foreground">−{discountPercent(product)}%</span>
              )}
              <FavoriteButton productId={product.id} name={product.name} size="lg" className="absolute right-4 top-4" />
            </div>

            {product.colorways.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5" role="group" aria-label="Colourway previews">
                {product.colorways.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickColor(c.id)}
                    aria-label={c.name}
                    aria-pressed={c.id === colorway.id}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-2xl border bg-surface transition-colors",
                      c.id === colorway.id ? "border-foreground" : "border-white/[0.06] hover:border-white/25",
                    )}
                  >
                    <img src={c.image} alt="" className="h-full w-full -rotate-12 object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="pb-8">
            <motion.div initial={{ opacity: 0, y: 24, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: EASE }}>
              <p className="text-sm text-muted-foreground">
                {genderLabel(product)} {product.tagline.toLowerCase()}
              </p>
              <h1 className="text-display mt-3 text-[clamp(2.5rem,5vw,4.25rem)]">{product.name.replace(/^Hike /, "")}</h1>
              <Price product={product} className="mt-5 text-2xl font-semibold" />
            </motion.div>

            <fieldset className="mt-10">
              <legend className="mb-3 flex w-full items-baseline justify-between text-sm">
                <span className="font-semibold">Colour</span>
                <span className="text-muted-foreground">{colorway.name}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.colorways.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickColor(c.id)}
                    aria-pressed={c.id === colorway.id}
                    aria-label={c.name}
                    className={cn("h-10 w-10 rounded-full p-[3px] ring-1 transition-transform hover:scale-110", c.id === colorway.id ? "ring-foreground" : "ring-white/15")}
                  >
                    <span className="block h-full w-full rounded-full" style={{ background: `linear-gradient(135deg, ${c.swatch[0]} 50%, ${c.swatch[1]} 50%)` }} />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-8" id="size-grid">
              <legend className="mb-3 flex w-full items-center justify-between text-sm">
                <span className={cn("font-semibold", sizeError && "text-destructive")}>Select size (US)</span>
                <button type="button" onClick={() => setGuideOpen(true)} className="inline-flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  <Ruler className="h-4 w-4" strokeWidth={1.75} /> Size guide
                </button>
              </legend>
              <div className={cn("grid grid-cols-4 gap-2 rounded-2xl sm:grid-cols-5", sizeError && "ring-1 ring-destructive ring-offset-4 ring-offset-background")}>
                {product.sizes.map((s) => {
                  const out = colorway.soldOut?.includes(s);
                  const on = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={out}
                      aria-pressed={on}
                      aria-label={out ? `US ${s}, sold out` : `US ${s}`}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                      className={cn(
                        "tabular relative h-12 rounded-xl border text-sm font-medium transition-[background-color,border-color,color] duration-200",
                        on ? "border-foreground bg-foreground text-background" : "border-surface-3 hover:border-foreground/60",
                        out && "cursor-not-allowed text-muted-foreground/50 line-through decoration-1",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  Pick a size to add this pair to your bag.
                </p>
              )}
            </fieldset>

            <div className="mt-8 flex gap-3">
              <Button variant="signal" size="lg" className="flex-1" onClick={add}>
                Add to bag
              </Button>
              <FavoriteButton productId={product.id} name={product.name} size="lg" className="border-surface-3 bg-transparent" />
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4" strokeWidth={1.75} /> Free delivery on orders over ${FREE_SHIPPING_FROM}
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Free 30-day returns
              </li>
            </ul>

            <p className="mt-10 max-w-[60ch] leading-relaxed text-foreground/85">{product.description}</p>

            <Accordion.Root type="multiple" defaultValue={["specs"]} className="mt-8 divide-y divide-border border-y border-border">
              {[
                {
                  id: "features",
                  title: "Features",
                  body: (
                    <ul className="space-y-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-glow" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "specs",
                  title: "Specs",
                  body: (
                    <dl className="divide-y divide-border">
                      {product.specs.map((s) => (
                        <div key={s.label} className="flex justify-between py-2.5">
                          <dt className="text-muted-foreground">{s.label}</dt>
                          <dd className="tabular font-medium">{s.value}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between py-2.5">
                        <dt className="text-muted-foreground">Style code</dt>
                        <dd className="tabular font-medium uppercase">
                          HK-{product.id.slice(0, 4)}-{colorway.id.slice(0, 3)}
                        </dd>
                      </div>
                    </dl>
                  ),
                },
                {
                  id: "delivery",
                  title: "Delivery & returns",
                  body: (
                    <p className="leading-relaxed">
                      This is a demo store, so nothing ships. In a real store: standard delivery in 3–5 working days, free over ${FREE_SHIPPING_FROM}, and free returns within 30 days.
                    </p>
                  ),
                },
              ].map((item) => (
                <Accordion.Item key={item.id} value={item.id}>
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between py-5 text-left font-semibold">
                      {item.title}
                      <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" strokeWidth={1.75} />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden text-sm text-foreground/80 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="pb-6">{item.body}</div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-full border border-white/10 bg-[hsl(222_14%_7%/0.85)] p-2 pl-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="tabular text-xs text-muted-foreground">{size ? `Size ${size}` : "No size selected"}</p>
        </div>
        <Button variant="signal" onClick={add}>
          Add to bag
        </Button>
      </div>

      <div className="mt-24 space-y-24">
        <ProductRail title="You may also like" products={relatedProducts(product, 8)} />
        {recentlyViewed.length > 0 && <ProductRail title="Recently viewed" products={recentlyViewed} />}
      </div>

      <Overlay open={guideOpen} onOpenChange={setGuideOpen} title="Size guide">
        <div className="flex-1 overflow-y-auto px-6 pb-8" data-lenis-prevent>
          <p className="text-sm text-muted-foreground">Measure your foot heel to toe and pick the closest length. Between sizes? Go half a size up.</p>
          <table className="tabular mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                {["US", "UK", "EU", "CM"].map((h) => (
                  <th key={h} scope="col" className="text-label pb-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SIZE_CHART.map((row) => (
                <tr key={row[0]} className={cn(size === row[0] && "text-signal")}>
                  {row.map((cell, i) => (
                    <td key={i} className="py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Overlay>
    </main>
  );
}
