import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/common/Button";
import { getProduct, type Product } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { EASE } from "@/lib/motion";

export default function Favorites() {
  const { favorites } = useShop();
  const list = favorites.map((id) => getProduct(id)).filter((p): p is Product => !!p);

  return (
    <main id="main" className="container max-w-[1440px] pb-10 pt-32 md:pt-40">
      <h1 className="text-display text-[clamp(2rem,9vw,5.5rem)]">Favourites</h1>
      <p className="mt-3 text-muted-foreground">{list.length ? `${list.length} saved ${list.length === 1 ? "pair" : "pairs"}` : "Nothing saved yet."}</p>

      {list.length === 0 ? (
        <div className="mt-16 flex flex-col items-start gap-6">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-2">
            <Heart className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="max-w-[44ch] text-muted-foreground">Tap the heart on any shoe to keep it here. Favourites are saved in this browser.</p>
          <ButtonLink to="/products">Browse sneakers</ButtonLink>
        </div>
      ) : (
        <motion.ul layout className="mt-12 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {list.map((p) => (
              <motion.li key={p.id} layout exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, ease: EASE }}>
                <ProductCard product={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </main>
  );
}
