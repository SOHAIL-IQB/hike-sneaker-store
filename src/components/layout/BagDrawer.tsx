import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag, Trash2 } from "lucide-react";
import Overlay from "@/components/common/Overlay";
import QtyStepper from "@/components/common/QtyStepper";
import { Button, ButtonLink } from "@/components/common/Button";
import { FREE_SHIPPING_FROM, formatPrice, getProduct } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { useUI } from "@/store/UIProvider";
import { trackBeginCheckout } from "@/lib/analytics";
import { EASE } from "@/lib/motion";

export default function BagDrawer() {
  const { bag, bagCount, subtotal, setQuantity, removeLine } = useShop();
  const { bagOpen, closeBag, justAdded } = useUI();
  const navigate = useNavigate();
  const added = justAdded ? getProduct(justAdded.productId) : undefined;
  const toFree = Math.max(0, FREE_SHIPPING_FROM - subtotal);

  const checkout = () => {
    trackBeginCheckout(bag, subtotal);
    closeBag();
    navigate("/checkout");
  };

  return (
    <Overlay open={bagOpen} onOpenChange={(o) => !o && closeBag()} title={`Bag${bagCount ? ` (${bagCount})` : ""}`}>
      <div role="status" aria-live="polite">
        <AnimatePresence>
          {added && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mx-6 mb-2 flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm text-success"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} /> {added.name} added — size {justAdded?.size}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {bag.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-2">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold">Your bag is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Pairs you add show up here.</p>
          </div>
          <ButtonLink to="/products" onClick={closeBag}>
            Shop sneakers
          </ButtonLink>
        </div>
      ) : (
        <>
          <div className="px-6 pb-3 pt-1">
            <p className="text-sm text-muted-foreground">
              {toFree > 0 ? (
                <>
                  Add <span className="tabular font-semibold text-foreground">{formatPrice(toFree)}</span> for free delivery
                </>
              ) : (
                <span className="text-success">You've unlocked free delivery</span>
              )}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className="h-full rounded-full bg-signal"
                initial={false}
                animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </div>
          </div>

          <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-2" data-lenis-prevent>
            <AnimatePresence initial={false}>
              {bag.map((line) => (
                <motion.li
                  key={line.key}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex gap-4 rounded-2xl bg-surface-2/60 p-3"
                >
                  <Link
                    to={`/products/${line.productId}?color=${encodeURIComponent(line.colorwayId)}`}
                    onClick={closeBag}
                    className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-surface-3/50"
                  >
                    <img src={line.colorway.image} alt={`${line.product.name}, ${line.colorway.name}`} className="h-20 w-20 object-contain" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{line.product.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {line.colorway.name} · Size {line.size}
                        </p>
                      </div>
                      <p className="tabular shrink-0 font-semibold">{formatPrice(line.lineTotal)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <QtyStepper value={line.quantity} onChange={(n) => setQuantity(line.key, n)} label={line.product.name} />
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
                        aria-label={`Remove ${line.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="space-y-4 border-t border-border px-6 pb-6 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular text-xl font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink to="/cart" variant="outline" onClick={closeBag}>
                View bag
              </ButtonLink>
              <Button variant="signal" onClick={checkout}>
                Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </Overlay>
  );
}
