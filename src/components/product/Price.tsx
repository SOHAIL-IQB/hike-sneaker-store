import { formatPrice, isOnSale, type Product } from "@/data/products";
import { cn } from "@/lib/utils";

export default function Price({ product, className }: { product: Product; className?: string }) {
  const sale = isOnSale(product);
  return (
    <span className={cn("tabular inline-flex items-baseline gap-2", className)}>
      <span className={sale ? "text-signal" : undefined}>{formatPrice(product.price)}</span>
      {sale && (
        <>
          <s className="text-[0.85em] text-muted-foreground">{formatPrice(product.compareAt!)}</s>
          <span className="sr-only">on sale, was {formatPrice(product.compareAt!)}</span>
        </>
      )}
    </span>
  );
}

export const discountPercent = (p: Product) => (p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0);
