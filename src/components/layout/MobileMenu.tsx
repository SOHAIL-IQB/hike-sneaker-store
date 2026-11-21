import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import Overlay from "@/components/common/Overlay";
import { CATEGORIES } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { useUI } from "@/store/UIProvider";
import { EASE } from "@/lib/motion";

const LINKS = [
  { label: "New arrivals", to: "/products?sort=newest" },
  ...CATEGORIES.map((c) => ({ label: c.label, to: `/products?category=${c.id}` })),
  { label: "Sale", to: "/products?sale=1" },
  { label: "All sneakers", to: "/products" },
];

export default function MobileMenu() {
  const { menuOpen, setMenuOpen, openBag } = useUI();
  const { bagCount, favorites } = useShop();
  const close = () => setMenuOpen(false);

  return (
    <Overlay open={menuOpen} onOpenChange={setMenuOpen} title="Menu" hideTitle side="left">
      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-8">
        <ul className="space-y-1">
          {LINKS.map((l, i) => (
            <motion.li
              key={l.to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.6, ease: EASE }}
            >
              <Link
                to={l.to}
                onClick={close}
                className="group flex items-center justify-between py-2.5 text-display text-[2rem] transition-colors hover:text-signal"
              >
                {l.label}
                <ArrowUpRight className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
              </Link>
            </motion.li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-2">
          <Link to="/favorites" onClick={close} className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-4 text-sm font-semibold">
            <Heart className="h-4 w-4" strokeWidth={1.75} /> Favourites ({favorites.length})
          </Link>
          <button
            type="button"
            onClick={() => {
              close();
              openBag();
            }}
            className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-4 text-left text-sm font-semibold"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} /> Bag ({bagCount})
          </button>
        </div>
      </nav>
    </Overlay>
  );
}
