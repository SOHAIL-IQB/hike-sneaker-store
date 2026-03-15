import { Link } from "react-router-dom";
import type { Product } from "@/lib/products";

const ProductCard = ({ product }: { product: Product }) => (
  <Link
    to={`/products/${product.id}`}
    className="group block"
  >
    <div className="bg-card overflow-hidden transition-transform duration-200 group-hover:scale-[1.02]">
      <div className="aspect-square flex items-center justify-center p-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
    <div className="mt-3 space-y-1">
      <h3 className="text-sm font-bold tracking-wide">{product.name.toUpperCase()}</h3>
      <p className="text-sm text-muted-foreground">${product.price}</p>
    </div>
  </Link>
);

export default ProductCard;
