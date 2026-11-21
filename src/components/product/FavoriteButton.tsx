import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useShop } from "@/store/ShopProvider";
import { cn } from "@/lib/utils";

export default function FavoriteButton({ productId, name, className, size = "md" }: { productId: string; name: string; className?: string; size?: "md" | "lg" }) {
  const { isFavorite, toggleFavorite } = useShop();
  const on = isFavorite(productId);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      className={cn(
        "relative grid place-items-center rounded-full border border-white/[0.08] bg-black/30 backdrop-blur-md transition-colors hover:bg-black/50",
        size === "lg" ? "h-14 w-14" : "h-10 w-10",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={on ? "on" : "off"}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 22 }}
        >
          <Heart
            className={cn(size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]", on ? "fill-signal text-signal" : "text-foreground")}
            strokeWidth={1.75}
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
