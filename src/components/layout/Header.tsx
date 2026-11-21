import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { CATEGORIES, formatPrice, products, sortProducts, type Category } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { useUI } from "@/store/UIProvider";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string; to: string; category?: Category };

const NAV: NavItem[] = [
  { id: "new", label: "New", to: "/products?sort=newest" },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, to: `/products?category=${c.id}`, category: c.id })),
  { id: "sale", label: "Sale", to: "/products?sale=1" },
];

function useActiveNav() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  if (pathname !== "/products") return null;
  if (params.get("sale")) return "sale";
  if (params.get("category")) return params.get("category");
  if (params.get("sort") === "newest") return "new";
  return null;
}

const CountBadge = ({ n }: { n: number }) => (
  <AnimatePresence>
    {n > 0 && (
      <motion.span
        key={n}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 24 }}
        className="tabular absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[0.6875rem] font-bold text-signal-foreground"
      >
        {n > 9 ? "9+" : n}
      </motion.span>
    )}
  </AnimatePresence>
);

const iconBtn =
  "relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-surface-2 hover:text-foreground";

export default function Header() {
  const { bagCount, favorites } = useShop();
  const { openBag, setSearchOpen, setMenuOpen } = useUI();
  const active = useActiveNav();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mega, setMega] = useState<Category | null>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number>();
  const { scrollY } = useScroll();
  const location = useLocation();

  // Hide while scrolling down, reveal on the way back up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev && !mega);
  });

  useEffect(() => setMega(null), [location.pathname, location.search]);

  const openMega = (c?: Category) => {
    window.clearTimeout(closeTimer.current);
    setMega(c ?? null);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMega(null), 140);
  };

  const pill = hovered ?? active;
  const megaProducts = mega ? sortProducts(products.filter((p) => p.category === mega), "featured").slice(0, 3) : [];

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? -110 : 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4"
      onMouseLeave={() => {
        setHovered(null);
        scheduleClose();
      }}
    >
      <div
        className={cn(
          "mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 rounded-full border px-3 pl-5 transition-[background-color,border-color,box-shadow] duration-500 md:h-[60px]",
          scrolled || mega
            ? "border-white/[0.08] bg-[hsl(222_14%_7%/0.72)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <Link to="/" aria-label="Hike home" className="shrink-0 rounded-full">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.id} onMouseEnter={() => (item.category ? openMega(item.category) : openMega())}>
                <Link
                  to={item.to}
                  onMouseEnter={() => setHovered(item.id)}
                  onFocus={() => setHovered(item.id)}
                  onBlur={() => setHovered(null)}
                  aria-current={active === item.id ? "page" : undefined}
                  className={cn(
                    "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    item.id === "sale" ? "text-signal" : pill === item.id ? "text-foreground" : "text-foreground/70",
                  )}
                >
                  {pill === item.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5">
          <button type="button" className={iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-[19px] w-[19px]" strokeWidth={1.75} />
          </button>
          <Link to="/favorites" className={cn(iconBtn, "hidden sm:grid")} aria-label={`Favourites, ${favorites.length} items`}>
            <Heart className="h-[19px] w-[19px]" strokeWidth={1.75} />
            <CountBadge n={favorites.length} />
          </Link>
          <button type="button" className={iconBtn} aria-label={`Bag, ${bagCount} items`} onClick={() => openBag()}>
            <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.75} />
            <CountBadge n={bagCount} />
          </button>
          <button type="button" className={cn(iconBtn, "lg:hidden")} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Category preview panel */}
      <AnimatePresence>
        {mega && (
          <motion.div
            key="mega"
            initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: EASE }}
            onMouseEnter={() => openMega(mega)}
            onMouseLeave={scheduleClose}
            className="mx-auto mt-2 hidden max-w-[1440px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[hsl(222_14%_7%/0.86)] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:block"
          >
            <div className="grid grid-cols-[1fr_3fr] gap-8">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-display text-3xl">{CATEGORIES.find((c) => c.id === mega)?.label}</p>
                  <p className="mt-3 max-w-[24ch] text-sm text-muted-foreground">{CATEGORIES.find((c) => c.id === mega)?.blurb}</p>
                </div>
                <Link to={`/products?category=${mega}`} className="mt-6 text-sm font-semibold text-signal hover:underline">
                  Shop all {CATEGORIES.find((c) => c.id === mega)?.label.toLowerCase()} →
                </Link>
              </div>
              <ul className="grid grid-cols-3 gap-3">
                {megaProducts.map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.5, ease: EASE }}
                  >
                    <Link
                      to={`/products/${p.id}`}
                      className="group flex items-center gap-4 rounded-2xl bg-surface-2/60 p-3 transition-colors hover:bg-surface-2"
                    >
                      <img src={p.colorways[0].image} alt="" className="h-16 w-20 object-contain transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="tabular text-sm text-muted-foreground">{formatPrice(p.price)}</span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
