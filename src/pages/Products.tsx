import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Overlay from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import {
  CATEGORIES,
  GENDERS,
  filterProducts,
  products,
  sortProducts,
  type Category,
  type Gender,
  type SortKey,
} from "@/data/products";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

const PRICES = [
  { id: "", label: "Any price" },
  { id: "100", label: "Under $100" },
  { id: "150", label: "Under $150" },
];

const ALL_SIZES = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => {
  const kid = (s: string) => s.endsWith("Y");
  if (kid(a) !== kid(b)) return kid(a) ? -1 : 1;
  return parseFloat(a) - parseFloat(b);
});

function useFilters() {
  const [params, setParams] = useSearchParams();
  const list = (k: string) => params.get(k)?.split(",").filter(Boolean) ?? [];
  const state = {
    category: (params.get("category") as Category | null) ?? null,
    genders: list("gender") as Gender[],
    sizes: list("size"),
    maxPrice: params.get("price") ? Number(params.get("price")) : null,
    sale: params.get("sale") === "1",
    query: params.get("q") ?? "",
    sort: (params.get("sort") as SortKey) ?? "featured",
  };
  const set = (key: string, value: string | string[] | null) => {
    const next = new URLSearchParams(params);
    const v = Array.isArray(value) ? value.join(",") : value;
    if (v) next.set(key, v);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const toggleIn = (key: "gender" | "size", value: string) => {
    const cur = list(key);
    set(key, cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]);
  };
  const clear = () => {
    const next = new URLSearchParams();
    if (state.category) next.set("category", state.category);
    if (state.query) next.set("q", state.query);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const activeCount = state.genders.length + state.sizes.length + (state.maxPrice ? 1 : 0) + (state.sale ? 1 : 0);
  return { state, set, toggleIn, clear, activeCount };
}

type FiltersApi = ReturnType<typeof useFilters>;

function FilterPanel({ f }: { f: FiltersApi }) {
  const { state, set, toggleIn, clear, activeCount } = f;
  const chip = (on: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm transition-colors",
      on ? "border-foreground bg-foreground text-background" : "border-surface-3 text-foreground/80 hover:border-foreground/50",
    );
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-label mb-3 text-muted-foreground">Gender</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button key={g.id} type="button" aria-pressed={state.genders.includes(g.id)} onClick={() => toggleIn("gender", g.id)} className={chip(state.genders.includes(g.id))}>
              {g.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-label mb-3 text-muted-foreground">Size (US)</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_SIZES.map((s) => {
            const on = state.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggleIn("size", s)}
                className={cn(
                  "tabular h-10 rounded-xl border text-sm transition-colors",
                  on ? "border-foreground bg-foreground text-background" : "border-surface-3 hover:border-foreground/50",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-label mb-3 text-muted-foreground">Price</legend>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => {
            const on = String(state.maxPrice ?? "") === p.id;
            return (
              <button key={p.id || "any"} type="button" aria-pressed={on} onClick={() => set("price", p.id || null)} className={chip(on)}>
                {p.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-surface-2/60 px-4 py-3">
        <span className="font-medium">On sale</span>
        <span className="relative">
          <input type="checkbox" className="peer sr-only" checked={state.sale} onChange={(e) => set("sale", e.target.checked ? "1" : null)} />
          <span className="block h-7 w-12 rounded-full bg-surface-3 transition-colors peer-checked:bg-signal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal" />
          <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-foreground transition-transform duration-300 ease-out peer-checked:translate-x-5" />
        </span>
      </label>

      {activeCount > 0 && (
        <button type="button" onClick={clear} className="text-sm font-semibold text-signal hover:underline">
          Clear {activeCount} {activeCount === 1 ? "filter" : "filters"}
        </button>
      )}
    </div>
  );
}

export default function Products() {
  const f = useFilters();
  const { state, set } = f;
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const list = useMemo(() => sortProducts(filterProducts(products, state), state.sort), [state.category, state.genders.join(), state.sizes.join(), state.maxPrice, state.sale, state.query, state.sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const cat = CATEGORIES.find((c) => c.id === state.category);
  const title = state.query ? `“${state.query}”` : state.sale ? "Sale" : cat ? cat.label : state.sort === "newest" ? "New arrivals" : "All sneakers";
  const subtitle = state.query ? "Search results" : cat?.blurb ?? "Every Hike silhouette, every colourway.";

  const tabs: { id: string; label: string; to: Category | null }[] = [{ id: "all", label: "All", to: null }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, to: c.id }))];
  const activeTab = state.category ?? "all";

  return (
    <main id="main" className="pb-10 pt-28 md:pt-36">
      <header className="container max-w-[1440px]">
        <motion.div initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: EASE }}>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h1 className="text-display mt-3 text-[clamp(2rem,9vw,6rem)]">
            {title}
            <span className="tabular ml-3 align-top text-[0.3em] text-muted-foreground">{list.length}</span>
          </h1>
        </motion.div>

        {state.query && (
          <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2 text-sm hover:bg-surface-3">
            Clear search <X className="h-3.5 w-3.5" />
          </Link>
        )}

        <div className="sticky top-[84px] z-30 -mx-2 mt-8 flex items-center justify-between gap-3 rounded-full px-2 py-2 md:top-[92px]">
          <nav aria-label="Categories" className="no-scrollbar -my-2 flex overflow-x-auto rounded-full border border-white/[0.08] bg-[hsl(222_14%_7%/0.75)] p-1 backdrop-blur-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => set("category", t.to)}
                aria-pressed={activeTab === t.id}
                className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors", activeTab === t.id ? "text-background" : "text-foreground/70 hover:text-foreground")}
              >
                {activeTab === t.id && (
                  <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? setShowFilters((s) => !s) : setMobileFilters(true))}
              className="flex h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-[hsl(222_14%_7%/0.75)] px-4 text-sm font-medium backdrop-blur-xl hover:bg-surface-2"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">{showFilters ? "Hide filters" : "Filters"}</span>
              {f.activeCount > 0 && <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 text-[11px] font-bold text-signal-foreground">{f.activeCount}</span>}
            </button>
            <label className="relative hidden sm:block">
              <span className="sr-only">Sort by</span>
              <select
                value={state.sort}
                onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
                className="h-11 appearance-none rounded-full border border-white/[0.08] bg-[hsl(222_14%_7%/0.75)] pl-4 pr-10 text-sm font-medium backdrop-blur-xl hover:bg-surface-2 focus:outline-none focus-visible:border-signal"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </label>
          </div>
        </div>
      </header>

      <div className="container mt-8 flex max-w-[1440px] gap-10">
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.aside
              key="filters"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="hidden shrink-0 overflow-clip lg:block"
              aria-label="Filters"
            >
              <div className="sticky top-[168px] w-64 pb-10">
                <FilterPanel f={f} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="min-w-0 flex-1" aria-live="polite" aria-label="Products">
          {list.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start gap-5 rounded-[28px] border border-dashed border-surface-3 p-10">
              <p className="text-display text-3xl">No matches</p>
              <p className="max-w-[46ch] text-muted-foreground">Nothing fits every filter you picked. Remove a size or price limit to see more.</p>
              <Button variant="outline" onClick={f.clear}>
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <motion.ul layout className={cn("grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2", showFilters ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4")}>
              <AnimatePresence mode="popLayout">
                {list.map((p, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
                    transition={{ duration: 0.6, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                  >
                    <ProductCard product={p} priority={i < 3} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </section>
      </div>

      <Overlay open={mobileFilters} onOpenChange={setMobileFilters} title="Filters" side="right">
        <div className="flex-1 overflow-y-auto px-6 py-4" data-lenis-prevent>
          <label className="relative mb-8 block sm:hidden">
            <span className="text-label mb-3 block text-muted-foreground">Sort by</span>
            <select
              value={state.sort}
              onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-surface-3 bg-surface-2 px-5 text-sm font-medium"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <FilterPanel f={f} />
        </div>
        <div className="border-t border-border p-5">
          <Button className="w-full" onClick={() => setMobileFilters(false)}>
            Show {list.length} {list.length === 1 ? "result" : "results"}
          </Button>
        </div>
      </Overlay>
    </main>
  );
}
