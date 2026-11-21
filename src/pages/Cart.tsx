import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/common/Button";
import QtyStepper from "@/components/common/QtyStepper";
import OrderSummary from "@/components/common/OrderSummary";
import ProductRail from "@/components/product/ProductRail";
import { formatPrice, getColorway, products, sortProducts } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { trackBeginCheckout } from "@/lib/analytics";
import { EASE } from "@/lib/motion";

export default function Cart() {
  const { bag, bagCount, subtotal, setQuantity, changeSize, removeLine } = useShop();
  const navigate = useNavigate();

  const checkout = () => {
    trackBeginCheckout(bag, subtotal);
    navigate("/checkout");
  };

  return (
    <main id="main" className="pt-28 md:pt-36">
      <div className="container max-w-[1440px]">
        <h1 className="text-display text-[clamp(2.5rem,7vw,5.5rem)]">
          Bag <span className="tabular align-top text-[0.35em] text-muted-foreground">{bagCount}</span>
        </h1>

        {bag.length === 0 ? (
          <div className="mt-12 flex flex-col items-start gap-6">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-2">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="max-w-[44ch] text-muted-foreground">There's nothing in your bag yet. Your bag is saved in this browser, so it'll still be here next time.</p>
            <ButtonLink to="/products">Shop sneakers</ButtonLink>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {bag.map((line) => (
                  <motion.li
                    key={line.key}
                    layout
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex gap-5 rounded-[28px] border border-white/[0.06] bg-surface p-4 edge-light sm:p-5"
                  >
                    <Link to={`/products/${line.productId}?color=${line.colorwayId}`} className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-surface-2 sm:h-36 sm:w-36">
                      <img src={line.colorway.image} alt={`${line.product.name}, ${line.colorway.name}`} className="h-[85%] w-[85%] -rotate-12 object-contain" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link to={`/products/${line.productId}`} className="font-semibold hover:underline">
                            {line.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{line.colorway.name}</p>
                        </div>
                        <p className="tabular font-semibold">{formatPrice(line.lineTotal)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm">
                          <span className="sr-only">Size</span>
                          <select
                            value={line.size}
                            onChange={(e) => changeSize(line.key, e.target.value)}
                            className="tabular h-10 rounded-full border border-surface-3 bg-surface-2 px-4 text-sm"
                          >
                            {line.product.sizes.map((s) => {
                              const out = getColorway(line.product, line.colorwayId).soldOut?.includes(s);
                              return (
                                <option key={s} value={s} disabled={out}>
                                  Size {s}
                                  {out ? " — sold out" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                        <QtyStepper value={line.quantity} onChange={(n) => setQuantity(line.key, n)} label={line.product.name} />
                        <button
                          type="button"
                          onClick={() => removeLine(line.key)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[28px] border border-white/[0.06] bg-surface p-6 edge-light">
                <h2 className="text-display mb-6 text-xl">Summary</h2>
                <OrderSummary subtotal={subtotal}>
                  <Button variant="signal" size="lg" className="mt-4 w-full" onClick={checkout}>
                    Checkout
                  </Button>
                </OrderSummary>
              </div>
            </aside>
          </div>
        )}
      </div>
      <div className="mt-28">
        <ProductRail title="Complete the rotation" products={sortProducts(products, "featured").filter((p) => !bag.some((l) => l.productId === p.id)).slice(0, 8)} />
      </div>
    </main>
  );
}
