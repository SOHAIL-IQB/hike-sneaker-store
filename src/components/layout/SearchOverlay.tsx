import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import Overlay from "@/components/common/Overlay";
import { filterProducts, formatPrice, products, sortProducts } from "@/data/products";
import { useUI } from "@/store/UIProvider";
import { EASE } from "@/lib/motion";

const SUGGESTIONS = ["Running", "Carbon", "Basketball", "Trail", "Knit", "Sale"];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchOpen) setQ("");
  }, [searchOpen]);

  // ⌘K / Ctrl+K opens search from anywhere. (No single-key shortcut, so speech and switch users can't trigger it by accident.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(
    () => (q.trim() ? sortProducts(filterProducts(products, { query: q }), "featured").slice(0, 6) : []),
    [q],
  );

  const submit = (term: string) => {
    if (!term.trim()) return;
    setSearchOpen(false);
    navigate(`/products?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <Overlay open={searchOpen} onOpenChange={setSearchOpen} title="Search" hideTitle side="top">
      <form
        role="search"
        className="px-5 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
      >
        <label className="flex items-center gap-3 rounded-full border border-surface-3 bg-surface-2/60 px-5 transition-colors focus-within:border-signal/70">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <span className="sr-only">Search sneakers</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shoes, colours, sports…"
            autoComplete="off"
            className="h-14 w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
        </label>
      </form>

      <p role="status" className="sr-only">
        {q.trim() ? `${results.length} ${results.length === 1 ? "result" : "results"}` : ""}
      </p>
      <div className="max-h-[60vh] overflow-y-auto px-5 pb-5" data-lenis-prevent>
        {!q.trim() ? (
          <div className="pt-3">
            <p className="text-label text-muted-foreground">Popular</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => (s === "Sale" ? (setSearchOpen(false), navigate("/products?sale=1")) : setQ(s))}
                  className="rounded-full border border-surface-3 px-4 py-2 text-sm transition-colors hover:border-foreground/50 hover:bg-surface-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No sneakers match “{q}”. Try a sport or a colour.</p>
        ) : (
          <ul className="space-y-1 pt-2">
            <AnimatePresence initial={false}>
              {results.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0.35, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.4, ease: EASE } }}
                  exit={{ opacity: 0 }}
                >
                  <Link
                    to={`/products/${p.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-surface-2"
                  >
                    <span className="grid h-14 w-16 place-items-center rounded-xl bg-surface-2">
                      <img src={p.colorways[0].image} alt="" className="h-12 w-14 object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="block truncate text-sm capitalize text-muted-foreground">
                        {p.tagline} · {p.category}
                      </span>
                    </span>
                    <span className="tabular text-sm font-semibold">{formatPrice(p.price)}</span>
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
            <li>
              <button type="button" onClick={() => submit(q)} className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-signal hover:bg-surface-2">
                See all results for “{q}”
              </button>
            </li>
          </ul>
        )}
      </div>
    </Overlay>
  );
}
