import { FREE_SHIPPING_FROM, formatPrice, shippingFor } from "@/data/products";

export default function OrderSummary({ subtotal, children }: { subtotal: number; children?: React.ReactNode }) {
  const shipping = shippingFor(subtotal);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="tabular">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Delivery</span>
        <span className="tabular">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
      </div>
      {shipping > 0 && <p className="text-xs text-muted-foreground">Free delivery from {formatPrice(FREE_SHIPPING_FROM)}.</p>}
      <div className="flex items-baseline justify-between border-t border-border pt-4">
        <span className="font-semibold">Total</span>
        <span className="tabular text-2xl font-semibold">{formatPrice(subtotal + shipping)}</span>
      </div>
      {children}
    </div>
  );
}
